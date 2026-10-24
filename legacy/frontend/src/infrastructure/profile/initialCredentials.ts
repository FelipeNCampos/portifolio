export interface InitialCredential {
  readonly id: string
  readonly title: string
  readonly issuer: string
  readonly completedAt?: string
  readonly hours?: number
  readonly evidence: string
  readonly evidenceLabel: string
  readonly verificationUrl?: string
}

const aws = (id: string, title: string, completedAt: string): InitialCredential => ({
  id, title: `AWS SimuLearn: ${title}`, issuer: 'AWS Training & Certification', completedAt,
  evidence: `/credentials/aws-${id}.pdf`, evidenceLabel: 'Abrir certificado PDF',
})

/** Títulos e datas transcritos dos documentos enviados; não representam exame AWS Certified. */
export const awsCredentials = [
  aws('cloud-practitioner', 'Cloud Practitioner', '2026-10-20'),
  aws('auto-healing', 'Auto-Healing and Scaling Applications', '2026-10-19'),
  aws('cloud-economics', 'Cloud Economics', '2026-10-16'),
  aws('cloud-first-steps', 'Cloud First Steps', '2026-10-10'),
  aws('computing-essentials', 'Cloud Computing Essentials', '2026-10-10'),
  aws('computing-solutions', 'Computing Solutions', '2026-10-15'),
  aws('connecting-vpcs', 'Connecting VPCs', '2026-10-20'),
  aws('core-security', 'Core Security Concepts', '2026-10-19'),
  aws('databases', 'Databases in Practice', '2026-10-19'),
  aws('file-systems', 'File Systems in the Cloud', '2026-10-18'),
  aws('first-nosql', 'First NoSQL Database', '2026-10-15'),
  aws('highly-available', 'Highly Available Web Applications', '2026-10-20'),
  aws('networking', 'Networking Concepts', '2026-10-16'),
] as const

export const pythonBootcamp: InitialCredential = {
  id: 'python-bootcamp', title: '100 Days of Code™: The Complete Python Pro Bootcamp',
  issuer: 'Udemy · Dr. Angela Yu', completedAt: '2026-09-01', hours: 57,
  evidence: '/credentials/python-100-days.pdf', evidenceLabel: 'Abrir certificado PDF',
  verificationUrl: 'https://ude.my/UC-136367b3-e7dd-4c51-bceb-237891fa109e',
}

// O comprovante em imagem não informa emissor nem data de conclusão.
export const pythonWorlds: readonly InitialCredential[] = [1, 2, 3].map((world) => ({
  id: `python-mundo-${world}`, title: `Python 3 - Mundo ${world}`, issuer: 'Emissor não informado no comprovante',
  hours: 40, evidence: '/credentials/python-mundos.png', evidenceLabel: 'Ver comprovante de conclusão',
}))
