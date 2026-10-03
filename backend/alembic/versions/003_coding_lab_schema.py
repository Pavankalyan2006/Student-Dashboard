"""coding lab schema

Revision ID: 003_coding_lab_schema
Revises: 002_documents_schema
Create Date: 2026-10-01 11:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '003_coding_lab_schema'
down_revision = '002_documents_schema'
branch_labels = None
depends_on = None

def upgrade():
    # 1. coding_problems table
    op.create_table(
        'coding_problems',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('difficulty', sa.String(length=32), nullable=False),
        sa.Column('topic', sa.String(length=100), nullable=False),
        sa.Column('constraints', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('input_format', sa.Text(), nullable=False),
        sa.Column('output_format', sa.Text(), nullable=False),
        sa.Column('examples', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('starter_code', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('supported_languages', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('tags', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('hints', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_coding_problems_id'), 'coding_problems', ['id'], unique=False)
    op.create_index(op.f('ix_coding_problems_slug'), 'coding_problems', ['slug'], unique=True)
    op.create_index(op.f('ix_coding_problems_difficulty'), 'coding_problems', ['difficulty'], unique=False)
    op.create_index(op.f('ix_coding_problems_topic'), 'coding_problems', ['topic'], unique=False)
    op.create_index(op.f('ix_coding_problems_created_at'), 'coding_problems', ['created_at'], unique=False)

    # 2. coding_test_cases table
    op.create_table(
        'coding_test_cases',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('problem_id', sa.String(length=64), nullable=False),
        sa.Column('input', sa.Text(), nullable=False),
        sa.Column('expected_output', sa.Text(), nullable=False),
        sa.Column('is_hidden', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['problem_id'], ['coding_problems.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_coding_test_cases_id'), 'coding_test_cases', ['id'], unique=False)
    op.create_index(op.f('ix_coding_test_cases_problem_id'), 'coding_test_cases', ['problem_id'], unique=False)

    # 3. coding_sessions table
    op.create_table(
        'coding_sessions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('language', sa.String(length=32), nullable=False),
        sa.Column('source_code', sa.Text(), nullable=False),
        sa.Column('stdin', sa.Text(), nullable=False, server_default=''),
        sa.Column('problem_id', sa.String(length=64), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='active'),
        sa.Column('last_execution_id', sa.String(length=64), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['problem_id'], ['coding_problems.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_coding_sessions_id'), 'coding_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_coding_sessions_student_id'), 'coding_sessions', ['student_id'], unique=False)
    op.create_index(op.f('ix_coding_sessions_problem_id'), 'coding_sessions', ['problem_id'], unique=False)
    op.create_index(op.f('ix_coding_sessions_created_at'), 'coding_sessions', ['created_at'], unique=False)

    # 4. saved_code table
    op.create_table(
        'saved_code',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('language', sa.String(length=32), nullable=False),
        sa.Column('source_code', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('last_opened_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_saved_code_id'), 'saved_code', ['id'], unique=False)
    op.create_index(op.f('ix_saved_code_student_id'), 'saved_code', ['student_id'], unique=False)
    op.create_index(op.f('ix_saved_code_created_at'), 'saved_code', ['created_at'], unique=False)

    # 5. code_executions table
    op.create_table(
        'code_executions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('session_id', sa.String(length=64), nullable=True),
        sa.Column('problem_id', sa.String(length=64), nullable=True),
        sa.Column('language', sa.String(length=32), nullable=False),
        sa.Column('source_code_snapshot', sa.Text(), nullable=False),
        sa.Column('stdin', sa.Text(), nullable=False, server_default=''),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('stdout', sa.Text(), nullable=False, server_default=''),
        sa.Column('stderr', sa.Text(), nullable=False, server_default=''),
        sa.Column('exit_code', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('execution_time_ms', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('memory_kb', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['session_id'], ['coding_sessions.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['problem_id'], ['coding_problems.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_code_executions_id'), 'code_executions', ['id'], unique=False)
    op.create_index(op.f('ix_code_executions_student_id'), 'code_executions', ['student_id'], unique=False)
    op.create_index(op.f('ix_code_executions_session_id'), 'code_executions', ['session_id'], unique=False)
    op.create_index(op.f('ix_code_executions_problem_id'), 'code_executions', ['problem_id'], unique=False)
    op.create_index(op.f('ix_code_executions_created_at'), 'code_executions', ['created_at'], unique=False)

    # 6. code_submissions table
    op.create_table(
        'code_submissions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('problem_id', sa.String(length=64), nullable=False),
        sa.Column('language', sa.String(length=32), nullable=False),
        sa.Column('source_code', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('passed_tests', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_tests', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('execution_time_ms', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('test_results', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['problem_id'], ['coding_problems.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_code_submissions_id'), 'code_submissions', ['id'], unique=False)
    op.create_index(op.f('ix_code_submissions_student_id'), 'code_submissions', ['student_id'], unique=False)
    op.create_index(op.f('ix_code_submissions_problem_id'), 'code_submissions', ['problem_id'], unique=False)
    op.create_index(op.f('ix_code_submissions_created_at'), 'code_submissions', ['created_at'], unique=False)


def downgrade():
    op.drop_table('code_submissions')
    op.drop_table('code_executions')
    op.drop_table('saved_code')
    op.drop_table('coding_sessions')
    op.drop_table('coding_test_cases')
    op.drop_table('coding_problems')
