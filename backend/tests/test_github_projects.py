import unittest
import os
import tempfile
from pathlib import Path
from unittest.mock import patch
from urllib.error import URLError
from http.client import IncompleteRead

from fastapi.testclient import TestClient

from backend.application.projects import GithubProjects
from backend.infrastructure.github import GithubRepositoryFeed
from backend.config.main import create_app


class GithubProjectsTests(unittest.TestCase):
    def test_public_feed_filters_forks_and_private_repositories(self):
        feed = GithubRepositoryFeed('FelipeNCampos', fetch=lambda _: [
            {"name":"produto", "language":"Python", "pushed_at":"2026-10-20T00:00:00Z"},
            {"name":"copia", "fork":True}, {"name":"privado", "private":True},
            {"name":"antigo", "archived":True}, {"name":"FelipeNCampos"},
            {"name":"../unsafe"},
        ])
        result = GithubProjects(feed).list()
        self.assertEqual([item['name'] for item in result['repositories']], ['produto'])
        self.assertEqual(result['repositories'][0]['url'], 'https://github.com/FelipeNCampos/produto')

    def test_cache_avoids_repeated_github_requests(self):
        calls = []
        feed = GithubRepositoryFeed('FelipeNCampos', fetch=lambda username: calls.append(username) or [], clock=lambda: 100)
        self.assertEqual(feed.read()['status'], 'live')
        self.assertEqual(feed.read()['status'], 'cached')
        self.assertEqual(len(calls), 1)

    def test_failed_refresh_preserves_last_response_and_backs_off(self):
        now = [0]
        calls = []
        def fetch(_):
            calls.append(1)
            if len(calls) > 1:
                raise URLError('offline')
            return [{"name":"saved"}]
        feed = GithubRepositoryFeed('FelipeNCampos', fetch=fetch, clock=lambda: now[0])
        feed.read()
        now[0] = 901
        self.assertEqual(feed.read()['status'], 'stale')
        self.assertEqual(feed.read()['repositories'][0]['name'], 'saved')
        self.assertEqual(len(calls), 2)

    def test_no_cached_data_is_an_explicit_unavailable_state(self):
        def offline(_):
            raise URLError('offline')
        result = GithubProjects(GithubRepositoryFeed('FelipeNCampos', fetch=offline)).list()
        self.assertEqual(result['status'], 'unavailable')
        self.assertEqual(result['repositories'], [])

    def test_interrupted_response_is_an_unavailable_feed(self):
        def interrupted(_):
            raise IncompleteRead(b'partial')
        feed = GithubRepositoryFeed('FelipeNCampos', fetch=interrupted)
        self.assertEqual(feed.read()['status'], 'unavailable')

    def test_username_cannot_change_upstream_host_or_path(self):
        with self.assertRaises(ValueError):
            GithubRepositoryFeed('../metadata')

    def test_invalid_upstream_response_preserves_cache(self):
        now = [0]
        responses = iter([[{"name":"saved"}], {"message":"rate limit"}])
        feed = GithubRepositoryFeed('FelipeNCampos', fetch=lambda _: next(responses), clock=lambda: now[0])
        feed.read()
        now[0] = 901
        self.assertEqual(feed.read()['status'], 'stale')
        self.assertEqual(feed.read()['repositories'][0]['name'], 'saved')

    def test_public_route_uses_feed_but_does_not_unlock_management(self):
        feed = GithubRepositoryFeed('FelipeNCampos', fetch=lambda _: [{"name":"produto", "html_url":"javascript:alert(1)"}])
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {"APP_DEMO_MODE":"true"}), patch('backend.config.main.GithubRepositoryFeed', return_value=feed):
            with TestClient(create_app(Path(directory) / 'api.sqlite3')) as client:
                response = client.get('/api/projects/github')
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()['repositories'][0]['url'], 'https://github.com/FelipeNCampos/produto')
                self.assertEqual(response.headers['x-content-type-options'], 'nosniff')
                self.assertEqual(client.get('/api/admin/credentials').status_code, 401)
