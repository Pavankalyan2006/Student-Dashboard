"""placement preparation and ai mock interview schema

Revision ID: 005_placement_schema
Revises: 004_dsa_schema
Create Date: 2026-10-02 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '005_placement_schema'
down_revision = '004_dsa_schema'
branch_labels = None
depends_on = None

def upgrade():
    # 1. placement_topics
    op.create_table(
        'placement_topics',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=64), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('difficulty', sa.String(length=32), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('prerequisites', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('concepts', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('common_questions', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('recommended_resources', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_placement_topics_id'), 'placement_topics', ['id'], unique=False)
    op.create_index(op.f('ix_placement_topics_slug'), 'placement_topics', ['slug'], unique=True)
    op.create_index(op.f('ix_placement_topics_category'), 'placement_topics', ['category'], unique=False)

    # 2. placement_questions
    op.create_table(
        'placement_questions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('topic_id', sa.String(length=64), nullable=False),
        sa.Column('category', sa.String(length=64), nullable=False),
        sa.Column('question_type', sa.String(length=32), nullable=False),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('options', sa.JSON(), nullable=True),
        sa.Column('correct_answer', sa.Text(), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=False),
        sa.Column('difficulty', sa.String(length=32), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['topic_id'], ['placement_topics.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_placement_questions_id'), 'placement_questions', ['id'], unique=False)
    op.create_index(op.f('ix_placement_questions_topic_id'), 'placement_questions', ['topic_id'], unique=False)
    op.create_index(op.f('ix_placement_questions_category'), 'placement_questions', ['category'], unique=False)

    # 3. placement_companies
    op.create_table(
        'placement_companies',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('website', sa.String(length=500), nullable=False),
        sa.Column('logo_url', sa.String(length=500), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_placement_companies_id'), 'placement_companies', ['id'], unique=False)
    op.create_index(op.f('ix_placement_companies_slug'), 'placement_companies', ['slug'], unique=True)

    # 4. placement_roles
    op.create_table(
        'placement_roles',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('skill_requirements', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('technical_topics', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('recommended_projects', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_placement_roles_id'), 'placement_roles', ['id'], unique=False)
    op.create_index(op.f('ix_placement_roles_slug'), 'placement_roles', ['slug'], unique=True)

    # 5. company_preparation_profiles
    op.create_table(
        'company_preparation_profiles',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('company_id', sa.String(length=64), nullable=False),
        sa.Column('role_id', sa.String(length=64), nullable=True),
        sa.Column('overview', sa.Text(), nullable=False),
        sa.Column('reported_rounds', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('topics', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('coding_topics', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('technical_topics', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('hr_topics', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('source_metadata', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('last_verified_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['placement_companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['role_id'], ['placement_roles.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_company_preparation_profiles_id'), 'company_preparation_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_company_preparation_profiles_company_id'), 'company_preparation_profiles', ['company_id'], unique=False)

    # 6. placement_plans
    op.create_table(
        'placement_plans',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('target_role_id', sa.String(length=64), nullable=False),
        sa.Column('target_company_id', sa.String(length=64), nullable=True),
        sa.Column('duration_weeks', sa.Integer(), nullable=False, server_default='4'),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('target_date', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['target_role_id'], ['placement_roles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['target_company_id'], ['placement_companies.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_placement_plans_id'), 'placement_plans', ['id'], unique=False)
    op.create_index(op.f('ix_placement_plans_student_id'), 'placement_plans', ['student_id'], unique=False)

    # 7. placement_plan_tasks
    op.create_table(
        'placement_plan_tasks',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('plan_id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=64), nullable=False),
        sa.Column('scheduled_week', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('scheduled_date', sa.String(length=32), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='PENDING'),
        sa.Column('source_type', sa.String(length=32), nullable=False),
        sa.Column('source_id', sa.String(length=64), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['plan_id'], ['placement_plans.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_placement_plan_tasks_id'), 'placement_plan_tasks', ['id'], unique=False)
    op.create_index(op.f('ix_placement_plan_tasks_plan_id'), 'placement_plan_tasks', ['plan_id'], unique=False)

    # 8. mock_interview_sessions
    op.create_table(
        'mock_interview_sessions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('interview_type', sa.String(length=32), nullable=False),
        sa.Column('role_id', sa.String(length=64), nullable=True),
        sa.Column('company_id', sa.String(length=64), nullable=True),
        sa.Column('project_id', sa.String(length=64), nullable=True),
        sa.Column('difficulty', sa.String(length=32), nullable=False, server_default='MEDIUM'),
        sa.Column('mode', sa.String(length=32), nullable=False, server_default='SIMULATION'),
        sa.Column('duration_minutes', sa.Integer(), nullable=False, server_default='30'),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='READY'),
        sa.Column('current_question_index', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('max_questions', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('overall_score', sa.Integer(), nullable=True),
        sa.Column('feedback_summary', sa.JSON(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['role_id'], ['placement_roles.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['company_id'], ['placement_companies.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_mock_interview_sessions_id'), 'mock_interview_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_mock_interview_sessions_student_id'), 'mock_interview_sessions', ['student_id'], unique=False)

    # 9. mock_interview_questions
    op.create_table(
        'mock_interview_questions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('session_id', sa.String(length=64), nullable=False),
        sa.Column('question_number', sa.Integer(), nullable=False),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('question_type', sa.String(length=32), nullable=False),
        sa.Column('topic', sa.String(length=128), nullable=False),
        sa.Column('difficulty', sa.String(length=32), nullable=False, server_default='MEDIUM'),
        sa.Column('expected_concepts', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('follow_up_to', sa.String(length=64), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['mock_interview_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_mock_interview_questions_id'), 'mock_interview_questions', ['id'], unique=False)
    op.create_index(op.f('ix_mock_interview_questions_session_id'), 'mock_interview_questions', ['session_id'], unique=False)

    # 10. mock_interview_answers
    op.create_table(
        'mock_interview_answers',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('session_id', sa.String(length=64), nullable=False),
        sa.Column('question_id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('answer_text', sa.Text(), nullable=False),
        sa.Column('duration_seconds', sa.Integer(), nullable=False, server_default='60'),
        sa.Column('evaluation', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['mock_interview_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['question_id'], ['mock_interview_questions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_mock_interview_answers_id'), 'mock_interview_answers', ['id'], unique=False)
    op.create_index(op.f('ix_mock_interview_answers_session_id'), 'mock_interview_answers', ['session_id'], unique=False)


def downgrade():
    op.drop_table('mock_interview_answers')
    op.drop_table('mock_interview_questions')
    op.drop_table('mock_interview_sessions')
    op.drop_table('placement_plan_tasks')
    op.drop_table('placement_plans')
    op.drop_table('company_preparation_profiles')
    op.drop_table('placement_roles')
    op.drop_table('placement_companies')
    op.drop_table('placement_questions')
    op.drop_table('placement_topics')
