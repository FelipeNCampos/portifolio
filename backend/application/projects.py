from backend.domain.projects import RepositoryFeed


class GithubProjects:
    def __init__(self, feed: RepositoryFeed):
        self._feed = feed

    def list(self):
        snapshot = self._feed.read()
        profile_url = f"https://github.com/{self._feed.username}"
        return {
            "status": snapshot["status"], "profileUrl": profile_url,
            "updatedAt": snapshot["updatedAt"],
            "repositories": [
                {"name": repo["name"], "description": repo["description"],
                 "language": repo["language"], "updatedAt": repo["pushed_at"],
                 "url": f"{profile_url}/{repo['name']}"}
                for repo in snapshot["repositories"]
                if not any((repo["fork"], repo["private"], repo["archived"]))
                and repo["name"].lower() != self._feed.username.lower()
            ],
        }
