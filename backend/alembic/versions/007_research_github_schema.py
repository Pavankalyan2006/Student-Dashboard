"""research assistant and github integration schema

Revision ID: 007_research_github_schema
Revises: 006_resume_career_skills_schema
Create Date: 2026-10-02 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '007_research_github_schema'
down_revision = '006_resume_career_skills_schema'
branch_labels = None
depends_on = None

def upgrade():
    # 1. research_projects
    op.create_table(
        'research_projects',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('topic', sa.String(length=255), nullable=False),
        sa.Column('domain', sa.String(length=128), nullable=False),
        sa.Column('branch', sa.String(length=128), nullable=False),
        sa.Column('research_type', sa.String(length=64), nullable=False, server_default='RESEARCH_PAPER'),
        sa.Column('objective', sa.Text(), nullable=False),
        sa.Column('research_question', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_research_projects_id'), 'research_projects', ['id'], unique=False)
    op.create_index(op.f('ix_research_projects_student_id'), 'research_projects', ['student_id'], unique=False)

    # 2. research_papers
    op.create_table(
        'research_papers',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('research_project_id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('document_id', sa.String(length=64), nullable=True),
        sa.Column('title', sa.String(length=512), nullable=False),
        sa.Column('abstract', sa.Text(), nullable=False),
        sa.Column('authors', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('publication_year', sa.Integer(), nullable=False),
        sa.Column('venue', sa.String(length=255), nullable=False),
        sa.Column('doi', sa.String(length=128), nullable=True),
        sa.Column('url', sa.String(length=512), nullable=True),
        sa.Column('provider', sa.String(length=64), nullable=False, server_default='MANUAL'),
        sa.Column('external_id', sa.String(length=128), nullable=True),
        sa.Column('citation_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_saved', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('metadata', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['research_project_id'], ['research_projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_research_papers_id'), 'research_papers', ['id'], unique=False)
    op.create_index(op.f('ix_research_papers_project_id'), 'research_papers', ['research_project_id'], unique=False)

    # 3. research_questions
    op.create_table(
        'research_questions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('research_project_id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=64), nullable=False, server_default='PRIMARY'),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='INVESTIGATING'),
        sa.Column('evidence', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['research_project_id'], ['research_projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 4. research_gaps
    op.create_table(
        'research_gaps',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('research_project_id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=64), nullable=False, server_default='METHODOLOGY'),
        sa.Column('evidence', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('confidence_status', sa.String(length=32), nullable=False, server_default='MEDIUM'),
        sa.Column('related_questions', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('supporting_paper_ids', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['research_project_id'], ['research_projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 5. research_ideas
    op.create_table(
        'research_ideas',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('research_project_id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('problem', sa.Text(), nullable=False),
        sa.Column('motivation', sa.Text(), nullable=False),
        sa.Column('proposed_approach', sa.Text(), nullable=False),
        sa.Column('technologies', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('dataset_possibilities', sa.Text(), nullable=False),
        sa.Column('evaluation_approach', sa.Text(), nullable=False),
        sa.Column('expected_contribution', sa.Text(), nullable=False),
        sa.Column('related_paper_ids', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('related_project_ids', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['research_project_id'], ['research_projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 6. research_methodologies
    op.create_table(
        'research_methodologies',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('research_project_id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('system_architecture', sa.Text(), nullable=False),
        sa.Column('experimental_design', sa.Text(), nullable=False),
        sa.Column('dataset_plan', sa.Text(), nullable=False),
        sa.Column('data_collection', sa.Text(), nullable=False),
        sa.Column('preprocessing', sa.Text(), nullable=False),
        sa.Column('model_selection', sa.Text(), nullable=False),
        sa.Column('evaluation_metrics', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('baseline_comparison', sa.Text(), nullable=False),
        sa.Column('reproducibility_checklist', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('is_proposed', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['research_project_id'], ['research_projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('research_project_id')
    )

    # 7. research_citations
    op.create_table(
        'research_citations',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('research_project_id', sa.String(length=64), nullable=True),
        sa.Column('paper_id', sa.String(length=64), nullable=True),
        sa.Column('source_type', sa.String(length=32), nullable=False, server_default='PAPER'),
        sa.Column('citation_style', sa.String(length=32), nullable=False, server_default='APA'),
        sa.Column('formatted_citation', sa.Text(), nullable=False),
        sa.Column('bibtex', sa.Text(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 8. literature_reviews
    op.create_table(
        'literature_reviews',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('research_project_id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('organization_style', sa.String(length=32), nullable=False, server_default='thematic'),
        sa.Column('outline', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('sections', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('synthesized_findings', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['research_project_id'], ['research_projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('research_project_id')
    )

    # 9. github_connections
    op.create_table(
        'github_connections',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('github_user_id', sa.String(length=64), nullable=False),
        sa.Column('username', sa.String(length=128), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=True),
        sa.Column('avatar_url', sa.String(length=512), nullable=True),
        sa.Column('encrypted_token', sa.Text(), nullable=False),
        sa.Column('scopes', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('is_connected', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id')
    )

    # 10. github_repositories
    op.create_table(
        'github_repositories',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('github_connection_id', sa.String(length=64), nullable=False),
        sa.Column('external_repo_id', sa.String(length=64), nullable=False),
        sa.Column('owner', sa.String(length=128), nullable=False),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('visibility', sa.String(length=32), nullable=False, server_default='PUBLIC'),
        sa.Column('default_branch', sa.String(length=64), nullable=False, server_default='main'),
        sa.Column('language', sa.String(length=64), nullable=False, server_default='TypeScript'),
        sa.Column('stars', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('forks', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('open_issues_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('url', sa.String(length=512), nullable=False),
        sa.Column('clone_url', sa.String(length=512), nullable=False),
        sa.Column('linked_project_id', sa.String(length=64), nullable=True),
        sa.Column('analysis_status', sa.String(length=32), nullable=False, server_default='NOT_ANALYZED'),
        sa.Column('last_synced_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_github_repositories_id'), 'github_repositories', ['id'], unique=False)
    op.create_index(op.f('ix_github_repositories_student_id'), 'github_repositories', ['student_id'], unique=False)

    # 11. github_repository_files
    op.create_table(
        'github_repository_files',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('repository_id', sa.String(length=64), nullable=False),
        sa.Column('path', sa.String(length=512), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('type', sa.String(length=32), nullable=False, server_default='file'),
        sa.Column('size', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('sha', sa.String(length=64), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['repository_id'], ['github_repositories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 12. github_commits
    op.create_table(
        'github_commits',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('repository_id', sa.String(length=64), nullable=False),
        sa.Column('hash', sa.String(length=64), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('author', sa.String(length=128), nullable=False),
        sa.Column('branch', sa.String(length=64), nullable=False, server_default='main'),
        sa.Column('files_changed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('additions', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('deletions', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('committed_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['repository_id'], ['github_repositories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 13. github_issues
    op.create_table(
        'github_issues',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('repository_id', sa.String(length=64), nullable=False),
        sa.Column('number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=512), nullable=False),
        sa.Column('body', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='open'),
        sa.Column('author', sa.String(length=128), nullable=False),
        sa.Column('labels', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['repository_id'], ['github_repositories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 14. github_pull_requests
    op.create_table(
        'github_pull_requests',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('repository_id', sa.String(length=64), nullable=False),
        sa.Column('number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=512), nullable=False),
        sa.Column('body', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='open'),
        sa.Column('author', sa.String(length=128), nullable=False),
        sa.Column('branch', sa.String(length=64), nullable=False),
        sa.Column('target_branch', sa.String(length=64), nullable=False, server_default='main'),
        sa.Column('files_changed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('additions', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('deletions', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['repository_id'], ['github_repositories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 15. github_repository_analyses
    op.create_table(
        'github_repository_analyses',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('repository_id', sa.String(length=64), nullable=False),
        sa.Column('architecture_components', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('technologies', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('frameworks', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('entry_points', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('apis', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('database_usage', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('dependencies', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('potential_security_concerns', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('maintainability_observations', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('observed_facts', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('ai_suggestions', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['repository_id'], ['github_repositories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('repository_id')
    )

def downgrade():
    op.drop_table('github_repository_analyses')
    op.drop_table('github_pull_requests')
    op.drop_table('github_issues')
    op.drop_table('github_commits')
    op.drop_table('github_repository_files')
    op.drop_table('github_repositories')
    op.drop_table('github_connections')
    op.drop_table('literature_reviews')
    op.drop_table('research_citations')
    op.drop_table('research_methodologies')
    op.drop_table('research_ideas')
    op.drop_table('research_gaps')
    op.drop_table('research_questions')
    op.drop_table('research_papers')
    op.drop_table('research_projects')
