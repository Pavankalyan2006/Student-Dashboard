// server/db/jobsCatalog.ts
// Categories, Subcategories, and Configured Multi-Source Registry for Jobs Discovery

import { JobSourceConfig } from '../models/jobDiscoveryTypes';

export interface CategoryDefinition {
  key: string;
  label: string;
  description: string;
  icon?: string;
}

export const GOVERNMENT_SUBCATEGORIES: CategoryDefinition[] = [
  { key: 'CENTRAL_GOVERNMENT', label: 'Central Government', description: 'Ministries, departments, and attached offices under Government of India' },
  { key: 'STATE_GOVERNMENT', label: 'State Government', description: 'State government departments and public service opportunities' },
  { key: 'PSU', label: 'Public Sector Undertakings (PSUs)', description: 'Maharatna, Navratna, and Miniratna public sector corporations (IOCL, NTPC, ONGC, BHEL, etc.)' },
  { key: 'BANKING', label: 'Banking & Financial Institutions', description: 'IBPS, SBI, RBI, and public sector bank IT Specialist Officer roles' },
  { key: 'RAILWAYS', label: 'Indian Railways (RRB)', description: 'Railway Recruitment Board Junior Engineers, Section Engineers, and technical cadres' },
  { key: 'DEFENCE', label: 'Defence & Military Technical', description: 'Indian Army, Navy, Air Force technical branches and Territorial Army' },
  { key: 'POLICE_PARAMILITARY', label: 'Police & Paramilitary Tech', description: 'State police technical wings, BSF, CRPF, ITBP, and CISF telecommunication cadres' },
  { key: 'CIVIL_SERVICES', label: 'Civil Services & Admin', description: 'All-India and central civil services administrative recruitments' },
  { key: 'SSC', label: 'Staff Selection Commission (SSC)', description: 'SSC Junior Engineer (JE), CGL, and Scientific Assistant notifications' },
  { key: 'UPSC', label: 'Union Public Service Commission', description: 'Engineering Services Examination (ESE), Combined Technical, and Central Officer exams' },
  { key: 'STATE_PSC', label: 'State Public Service Commissions', description: 'APPSC, TSPSC, TNPSC, KPSC, MPSC, UPPSC Assistant Engineer & tech posts' },
  { key: 'ENGINEERING_RECRUITMENT', label: 'Engineering Recruitment', description: 'Technical and engineering specialist openings for B.Tech/B.E. graduates' },
  { key: 'RESEARCH_SCIENTIFIC', label: 'Scientific & R&D Orgs', description: 'ISRO, DRDO, BARC, CSIR, and MeitY research and scientist recruitments' },
  { key: 'GOVERNMENT_IT_SOFTWARE', label: 'Government IT & Software', description: 'NIC, CDAC, STPI, and digital governance software engineer positions' },
  { key: 'APPRENTICESHIPS', label: 'Government Apprenticeships', description: 'National Apprenticeship Training Scheme (NATS) graduate apprenticeships' },
  { key: 'GOVERNMENT_INTERNSHIPS', label: 'Government Internships', description: 'NITI Aayog, Ministry of External Affairs, and departmental research internships' },
  { key: 'CONTRACT_GOVERNMENT', label: 'Contractual Government Posts', description: 'Project-based and fixed-tenure government engineering assignments' },
  { key: 'OTHER_GOVERNMENT', label: 'Other Government Recruitment', description: 'Autonomous bodies, statutory authorities, and university staff recruitments' },
];

export const PRIVATE_SUBCATEGORIES: CategoryDefinition[] = [
  { key: 'SOFTWARE_DEVELOPMENT', label: 'Software Development', description: 'General software engineering, product engineering, and SDET' },
  { key: 'QA_TESTING', label: 'Software Testing & QA', description: 'Manual testing, automation testing, Selenium, Cypress, and performance QA' },
  { key: 'JAVA_DEVELOPMENT', label: 'Java Development', description: 'Core Java, Spring Boot, microservices, and enterprise backend systems' },
  { key: 'PYTHON_DEVELOPMENT', label: 'Python Development', description: 'Django, FastAPI, automation scripting, and backend development' },
  { key: 'WEB_DEVELOPMENT', label: 'Web Development', description: 'Modern web architecture, Jamstack, responsive frontend and backend systems' },
  { key: 'FRONTEND_DEVELOPMENT', label: 'Frontend Development', description: 'React, Vue, Angular, Next.js, TypeScript, and modern CSS' },
  { key: 'BACKEND_DEVELOPMENT', label: 'Backend Development', description: 'Node.js, Go, Rust, distributed systems, and API design' },
  { key: 'FULLSTACK_DEVELOPMENT', label: 'Full-Stack Development', description: 'End-to-end web engineering covering database, server, and client' },
  { key: 'MOBILE_APP_DEVELOPMENT', label: 'Mobile App Development', description: 'Android (Kotlin), iOS (Swift), React Native, and Flutter' },
  { key: 'AI_MACHINE_LEARNING', label: 'AI & Machine Learning', description: 'LLMs, computer vision, NLP, PyTorch, TensorFlow, and MLOps' },
  { key: 'DATA_SCIENCE', label: 'Data Science', description: 'Statistical modeling, predictive analytics, and machine learning pipelines' },
  { key: 'DATA_ANALYTICS', label: 'Data Analytics', description: 'SQL, PowerBI, Tableau, data warehousing, and business metrics' },
  { key: 'CLOUD_COMPUTING', label: 'Cloud Computing', description: 'AWS, Google Cloud, Microsoft Azure, and cloud infrastructure' },
  { key: 'DEVOPS_SRE', label: 'DevOps & SRE', description: 'Kubernetes, Docker, CI/CD, Terraform, Prometheus, and reliability engineering' },
  { key: 'CYBERSECURITY', label: 'Cybersecurity', description: 'Information security, pen testing, SOC analysis, and vulnerability assessment' },
  { key: 'DATABASE_SQL', label: 'Database & SQL', description: 'PostgreSQL, MySQL, MongoDB, DBA, and database engineering' },
  { key: 'NETWORKING', label: 'Networking & Systems', description: 'Network engineering, CCNA, routing, firewalls, and telecom systems' },
  { key: 'SYSTEM_DESIGN_ARCHITECTURE', label: 'System Design & Architecture', description: 'High-level architecture, scalability, and distributed protocols' },
  { key: 'TECHNICAL_SUPPORT', label: 'Technical Support & Ops', description: 'IT support, system administration, and infrastructure maintenance' },
  { key: 'PRODUCT_MANAGEMENT', label: 'Product Management', description: 'Associate product manager (APM), tech roadmap, and user stories' },
  { key: 'BUSINESS_ANALYSIS', label: 'Business Analysis', description: 'Requirement gathering, tech documentation, and Agile analysis' },
  { key: 'DESIGN_UI_UX', label: 'Design & UI/UX', description: 'Figma, design systems, wireframing, and user interaction design' },
  { key: 'FRESHERS_ROLES', label: 'Freshers & Entry-Level', description: 'Roles welcoming 0-1 years experience with structured training' },
  { key: 'GRADUATE_TRAINEE', label: 'Graduate Engineer Trainee', description: 'GET and associate development programs across tech firms' },
  { key: 'INTERNSHIPS', label: 'Internships', description: 'Summer, winter, and semester-long tech internships' },
  { key: 'REMOTE_JOBS', label: 'Remote Opportunities', description: 'Work-from-home positions with global and domestic teams' },
  { key: 'OTHER_PRIVATE', label: 'Other Private Opportunities', description: 'Consulting, venture, and cross-functional technology roles' },
];

/**
 * Job sources. Only Remotive has a working adapter (its public JSON API); every other entry is a link to an official
 * portal with no machine-readable feed integrated, so it stays disabled and NOT_CONFIGURED. Health changes only after a real sync.
 */
export const INITIAL_JOB_SOURCES: JobSourceConfig[] = [
  {
    id: 'src_upsc_official',
    name: 'Union Public Service Commission (UPSC)',
    category: 'GOVERNMENT',
    type: 'GOVERNMENT_PORTAL',
    source_url: 'https://upsc.gov.in/recruitment',
    enabled: false,
    health_status: 'NOT_CONFIGURED',
    records_retrieved_last_run: 0,
    new_records_last_run: 0,
    updated_records_last_run: 0,
    duplicates_ignored_last_run: 0,
  },
  {
    id: 'src_ssc_official',
    name: 'Staff Selection Commission (SSC)',
    category: 'GOVERNMENT',
    type: 'GOVERNMENT_PORTAL',
    source_url: 'https://ssc.gov.in',
    enabled: false,
    health_status: 'NOT_CONFIGURED',
    records_retrieved_last_run: 0,
    new_records_last_run: 0,
    updated_records_last_run: 0,
    duplicates_ignored_last_run: 0,
  },
  {
    id: 'src_ibps_official',
    name: 'Institute of Banking Personnel Selection (IBPS)',
    category: 'GOVERNMENT',
    type: 'GOVERNMENT_PORTAL',
    source_url: 'https://www.ibps.in',
    enabled: false,
    health_status: 'NOT_CONFIGURED',
    records_retrieved_last_run: 0,
    new_records_last_run: 0,
    updated_records_last_run: 0,
    duplicates_ignored_last_run: 0,
  },
  {
    id: 'src_rrb_official',
    name: 'Railway Recruitment Boards (RRB Central)',
    category: 'GOVERNMENT',
    type: 'GOVERNMENT_PORTAL',
    source_url: 'https://indianrailways.gov.in',
    enabled: false,
    health_status: 'NOT_CONFIGURED',
    records_retrieved_last_run: 0,
    new_records_last_run: 0,
    updated_records_last_run: 0,
    duplicates_ignored_last_run: 0,
  },
  {
    id: 'src_ncs_india',
    name: 'National Career Service (NCS Ministry of Labour)',
    category: 'GOVERNMENT',
    type: 'GOVERNMENT_PORTAL',
    source_url: 'https://www.ncs.gov.in',
    enabled: false,
    health_status: 'NOT_CONFIGURED',
    records_retrieved_last_run: 0,
    new_records_last_run: 0,
    updated_records_last_run: 0,
    duplicates_ignored_last_run: 0,
  },
  {
    id: 'src_psu_gate',
    name: 'PSU Graduate Executive Recruitment (GATE Portal)',
    category: 'GOVERNMENT',
    type: 'GOVERNMENT_PORTAL',
    source_url: 'https://gate2026.iit.ac.in',
    enabled: false,
    health_status: 'NOT_CONFIGURED',
    records_retrieved_last_run: 0,
    new_records_last_run: 0,
    updated_records_last_run: 0,
    duplicates_ignored_last_run: 0,
  },
  {
    id: 'src_remotive_api',
    name: 'Remotive Public Tech API',
    category: 'PRIVATE',
    type: 'PUBLIC_JOB_API',
    source_url: 'https://remotive.com/api/remote-jobs',
    enabled: true,
    health_status: 'NOT_CONFIGURED',
    records_retrieved_last_run: 0,
    new_records_last_run: 0,
    updated_records_last_run: 0,
    duplicates_ignored_last_run: 0,
  },
  {
    id: 'src_arbeitnow_api',
    name: 'Arbeitnow Tech Jobs Feed',
    category: 'PRIVATE',
    type: 'PUBLIC_JOB_API',
    source_url: 'https://www.arbeitnow.com/api/job-board-api',
    enabled: false,
    health_status: 'NOT_CONFIGURED',
    records_retrieved_last_run: 0,
    new_records_last_run: 0,
    updated_records_last_run: 0,
    duplicates_ignored_last_run: 0,
  },
  {
    id: 'src_greenhouse_ats',
    name: 'Greenhouse Public Career Endpoints',
    category: 'PRIVATE',
    type: 'EMPLOYER_ATS',
    source_url: 'https://boards-api.greenhouse.io',
    enabled: false,
    health_status: 'NOT_CONFIGURED',
    records_retrieved_last_run: 0,
    new_records_last_run: 0,
    updated_records_last_run: 0,
    duplicates_ignored_last_run: 0,
  },
  {
    id: 'src_lever_ats',
    name: 'Lever Public Career Postings',
    category: 'PRIVATE',
    type: 'EMPLOYER_ATS',
    source_url: 'https://api.lever.co/v0/postings',
    enabled: false,
    health_status: 'NOT_CONFIGURED',
    records_retrieved_last_run: 0,
    new_records_last_run: 0,
    updated_records_last_run: 0,
    duplicates_ignored_last_run: 0,
  },
];

/**
 * Ids of listings that earlier versions seeded by hand (invented notification numbers, PDFs, salaries and deadlines).
 * They are removed from restored snapshots on start-up; no listing is seeded any more.
 */
export const RETIRED_SEED_JOB_IDS = [
  'govt_isro_sc_cse_2026', 'govt_iocl_gate_it_2026', 'govt_ibps_so_it_2026', 'govt_cdac_pe_swe_2026',
  'pvt_razorpay_sde1_2026', 'pvt_microsoft_swe_azure_2026', 'pvt_gitlab_junior_fullstack_2026', 'pvt_tcs_nqt_get_2026',
];
/** external_job_id values of the hard-coded "cached" and "government notification" fixtures the old sync inserted. */
export const RETIRED_FIXTURE_EXTERNAL_IDS = ['remotive_cache_01', 'upsc_ese_it_2026', 'ssc_je_cse_2026', 'rrb_je_it_2026'];
