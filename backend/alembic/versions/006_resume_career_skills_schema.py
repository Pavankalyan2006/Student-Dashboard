"""resume builder, career assistant, and skill assessment schema

Revision ID: 006_resume_career_skills_schema
Revises: 005_placement_schema
Create Date: 2026-10-02 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '006_resume_career_skills_schema'
down_revision = '005_placement_schema'
branch_labels = None
depends_on = None

def upgrade():
    # 1. resumes
    op.create_table(
        'resumes',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('template', sa.String(length=32), nullable=False, server_default='TECHNICAL'),
        sa.Column('target_role', sa.String(length=255), nullable=False),
        sa.Column('target_industry', sa.String(length=255), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='DRAFT'),
        sa.Column('section_order', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resumes_id'), 'resumes', ['id'], unique=False)
    op.create_index(op.f('ix_resumes_student_id'), 'resumes', ['student_id'], unique=False)

    # 2. resume_profiles
    op.create_table(
        'resume_profiles',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('resume_id', sa.String(length=64), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=64), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('website', sa.String(length=500), nullable=True),
        sa.Column('linkedin_url', sa.String(length=500), nullable=True),
        sa.Column('github_url', sa.String(length=500), nullable=True),
        sa.Column('portfolio_url', sa.String(length=500), nullable=True),
        sa.Column('headline', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('resume_id')
    )
    op.create_index(op.f('ix_resume_profiles_id'), 'resume_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_resume_profiles_resume_id'), 'resume_profiles', ['resume_id'], unique=True)

    # 3. resume_education
    op.create_table(
        'resume_education',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('resume_id', sa.String(length=64), nullable=False),
        sa.Column('institution', sa.String(length=255), nullable=False),
        sa.Column('degree', sa.String(length=255), nullable=False),
        sa.Column('field_of_study', sa.String(length=255), nullable=False),
        sa.Column('start_date', sa.String(length=32), nullable=False),
        sa.Column('end_date', sa.String(length=32), nullable=False),
        sa.Column('grade', sa.String(length=64), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resume_education_id'), 'resume_education', ['id'], unique=False)
    op.create_index(op.f('ix_resume_education_resume_id'), 'resume_education', ['resume_id'], unique=False)

    # 4. resume_skills
    op.create_table(
        'resume_skills',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('resume_id', sa.String(length=64), nullable=False),
        sa.Column('skill', sa.String(length=128), nullable=False),
        sa.Column('category', sa.String(length=64), nullable=False, server_default='PROGRAMMING'),
        sa.Column('proficiency', sa.String(length=32), nullable=False, server_default='INTERMEDIATE'),
        sa.Column('source', sa.String(length=64), nullable=False, server_default='STUDENT_ENTERED'),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resume_skills_id'), 'resume_skills', ['id'], unique=False)
    op.create_index(op.f('ix_resume_skills_resume_id'), 'resume_skills', ['resume_id'], unique=False)

    # 5. resume_projects
    op.create_table(
        'resume_projects',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('resume_id', sa.String(length=64), nullable=False),
        sa.Column('project_id', sa.String(length=64), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description_override', sa.Text(), nullable=True),
        sa.Column('highlighted_features', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('technologies', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resume_projects_id'), 'resume_projects', ['id'], unique=False)
    op.create_index(op.f('ix_resume_projects_resume_id'), 'resume_projects', ['resume_id'], unique=False)

    # 6. resume_experience
    op.create_table(
        'resume_experience',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('resume_id', sa.String(length=64), nullable=False),
        sa.Column('organization', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=255), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('start_date', sa.String(length=32), nullable=False),
        sa.Column('end_date', sa.String(length=32), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('achievements', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resume_experience_id'), 'resume_experience', ['id'], unique=False)
    op.create_index(op.f('ix_resume_experience_resume_id'), 'resume_experience', ['resume_id'], unique=False)

    # 7. resume_certifications
    op.create_table(
        'resume_certifications',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('resume_id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('issuer', sa.String(length=255), nullable=False),
        sa.Column('issue_date', sa.String(length=32), nullable=False),
        sa.Column('credential_id', sa.String(length=255), nullable=True),
        sa.Column('credential_url', sa.String(length=500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resume_certifications_id'), 'resume_certifications', ['id'], unique=False)
    op.create_index(op.f('ix_resume_certifications_resume_id'), 'resume_certifications', ['resume_id'], unique=False)

    # 8. resume_achievements
    op.create_table(
        'resume_achievements',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('resume_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('date', sa.String(length=32), nullable=True),
        sa.Column('source', sa.String(length=64), nullable=False, server_default='STUDENT_ENTERED'),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resume_achievements_id'), 'resume_achievements', ['id'], unique=False)
    op.create_index(op.f('ix_resume_achievements_resume_id'), 'resume_achievements', ['resume_id'], unique=False)

    # 9. resume_versions
    op.create_table(
        'resume_versions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('resume_id', sa.String(length=64), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('content_snapshot', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('created_by', sa.String(length=128), nullable=False, server_default='Student'),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resume_versions_id'), 'resume_versions', ['id'], unique=False)
    op.create_index(op.f('ix_resume_versions_resume_id'), 'resume_versions', ['resume_id'], unique=False)

    # 10. job_descriptions
    op.create_table(
        'job_descriptions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('company', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('source_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_job_descriptions_id'), 'job_descriptions', ['id'], unique=False)
    op.create_index(op.f('ix_job_descriptions_student_id'), 'job_descriptions', ['student_id'], unique=False)

    # 11. skills
    op.create_table(
        'skills',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('category', sa.String(length=64), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('parent_skill_id', sa.String(length=64), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['parent_skill_id'], ['skills.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skills_id'), 'skills', ['id'], unique=False)
    op.create_index(op.f('ix_skills_name'), 'skills', ['name'], unique=True)
    op.create_index(op.f('ix_skills_category'), 'skills', ['category'], unique=False)

    # 12. student_skills
    op.create_table(
        'student_skills',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('skill_id', sa.String(length=64), nullable=False),
        sa.Column('skill_name', sa.String(length=128), nullable=False),
        sa.Column('category', sa.String(length=64), nullable=False),
        sa.Column('source', sa.String(length=64), nullable=False, server_default='STUDENT_DECLARED'),
        sa.Column('evidence_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('proficiency', sa.String(length=32), nullable=False, server_default='INTERMEDIATE'),
        sa.Column('confidence', sa.String(length=32), nullable=False, server_default='LIMITED_EVIDENCE'),
        sa.Column('last_updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_student_skills_id'), 'student_skills', ['id'], unique=False)
    op.create_index(op.f('ix_student_skills_student_id'), 'student_skills', ['student_id'], unique=False)
    op.create_index(op.f('ix_student_skills_skill_id'), 'student_skills', ['skill_id'], unique=False)

    # 13. skill_evidence
    op.create_table(
        'skill_evidence',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_skill_id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('skill_id', sa.String(length=64), nullable=False),
        sa.Column('source_type', sa.String(length=64), nullable=False),
        sa.Column('source_id', sa.String(length=64), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_skill_id'], ['student_skills.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skill_evidence_id'), 'skill_evidence', ['id'], unique=False)
    op.create_index(op.f('ix_skill_evidence_student_skill_id'), 'skill_evidence', ['student_skill_id'], unique=False)
    op.create_index(op.f('ix_skill_evidence_student_id'), 'skill_evidence', ['student_id'], unique=False)

    # 14. skill_assessments
    op.create_table(
        'skill_assessments',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('skill_id', sa.String(length=64), nullable=False),
        sa.Column('difficulty', sa.String(length=32), nullable=False, server_default='INTERMEDIATE'),
        sa.Column('question_count', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='NOT_STARTED'),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('quiz_id', sa.String(length=64), nullable=True),
        sa.Column('quiz_attempt_id', sa.String(length=64), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skill_assessments_id'), 'skill_assessments', ['id'], unique=False)
    op.create_index(op.f('ix_skill_assessments_student_id'), 'skill_assessments', ['student_id'], unique=False)

    # 15. career_roadmaps
    op.create_table(
        'career_roadmaps',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('role_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='IN_PROGRESS'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_career_roadmaps_id'), 'career_roadmaps', ['id'], unique=False)
    op.create_index(op.f('ix_career_roadmaps_student_id'), 'career_roadmaps', ['student_id'], unique=False)

    # 16. career_roadmap_steps
    op.create_table(
        'career_roadmap_steps',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('roadmap_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='NOT_STARTED'),
        sa.Column('estimated_effort', sa.String(length=64), nullable=False),
        sa.Column('source_type', sa.String(length=64), nullable=False),
        sa.Column('source_id', sa.String(length=64), nullable=True),
        sa.Column('url', sa.String(length=500), nullable=True),
        sa.ForeignKeyConstraint(['roadmap_id'], ['career_roadmaps.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_career_roadmap_steps_id'), 'career_roadmap_steps', ['id'], unique=False)
    op.create_index(op.f('ix_career_roadmap_steps_roadmap_id'), 'career_roadmap_steps', ['roadmap_id'], unique=False)


def downgrade():
    op.drop_table('career_roadmap_steps')
    op.drop_table('career_roadmaps')
    op.drop_table('skill_assessments')
    op.drop_table('skill_evidence')
    op.drop_table('student_skills')
    op.drop_table('skills')
    op.drop_table('job_descriptions')
    op.drop_table('resume_versions')
    op.drop_table('resume_achievements')
    op.drop_table('resume_certifications')
    op.drop_table('resume_experience')
    op.drop_table('resume_projects')
    op.drop_table('resume_skills')
    op.drop_table('resume_education')
    op.drop_table('resume_profiles')
    op.drop_table('resumes')
