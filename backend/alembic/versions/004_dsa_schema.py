"""dsa lab schema

Revision ID: 004_dsa_schema
Revises: 003_coding_lab_schema
Create Date: 2026-10-01 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '004_dsa_schema'
down_revision = '003_coding_lab_schema'
branch_labels = None
depends_on = None

def upgrade():
    # 1. dsa_topics
    op.create_table(
        'dsa_topics',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=32), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('difficulty', sa.String(length=32), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('prerequisites', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('icon', sa.String(length=64), nullable=True),
        sa.Column('concepts', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dsa_topics_id'), 'dsa_topics', ['id'], unique=False)
    op.create_index(op.f('ix_dsa_topics_slug'), 'dsa_topics', ['slug'], unique=True)
    op.create_index(op.f('ix_dsa_topics_category'), 'dsa_topics', ['category'], unique=False)
    op.create_index(op.f('ix_dsa_topics_order_index'), 'dsa_topics', ['order_index'], unique=False)

    # 2. dsa_algorithms
    op.create_table(
        'dsa_algorithms',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('topic_id', sa.String(length=64), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('concept', sa.Text(), nullable=False),
        sa.Column('pseudocode', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('time_complexity', sa.String(length=64), nullable=False),
        sa.Column('space_complexity', sa.String(length=64), nullable=False),
        sa.Column('best_case', sa.String(length=64), nullable=False),
        sa.Column('average_case', sa.String(length=64), nullable=False),
        sa.Column('worst_case', sa.String(length=64), nullable=False),
        sa.Column('stable', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('in_place', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('visualization_type', sa.String(length=32), nullable=False),
        sa.Column('supported_languages', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('default_input', sa.JSON(), nullable=True),
        sa.Column('comparison_tags', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['topic_id'], ['dsa_topics.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dsa_algorithms_id'), 'dsa_algorithms', ['id'], unique=False)
    op.create_index(op.f('ix_dsa_algorithms_slug'), 'dsa_algorithms', ['slug'], unique=True)
    op.create_index(op.f('ix_dsa_algorithms_topic_id'), 'dsa_algorithms', ['topic_id'], unique=False)

    # 3. dsa_problems
    op.create_table(
        'dsa_problems',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('topic_id', sa.String(length=64), nullable=False),
        sa.Column('algorithm_id', sa.String(length=64), nullable=True),
        sa.Column('difficulty', sa.String(length=32), nullable=False),
        sa.Column('constraints', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('input_format', sa.Text(), nullable=False),
        sa.Column('output_format', sa.Text(), nullable=False),
        sa.Column('examples', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('starter_code', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('hints', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('solution_explanation', sa.Text(), nullable=True),
        sa.Column('supported_languages', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['topic_id'], ['dsa_topics.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['algorithm_id'], ['dsa_algorithms.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dsa_problems_id'), 'dsa_problems', ['id'], unique=False)
    op.create_index(op.f('ix_dsa_problems_slug'), 'dsa_problems', ['slug'], unique=True)
    op.create_index(op.f('ix_dsa_problems_topic_id'), 'dsa_problems', ['topic_id'], unique=False)

    # 4. dsa_progress
    op.create_table(
        'dsa_progress',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('topics_viewed', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('algorithms_viewed', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('visualizations_completed', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('problems_attempted', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('problems_solved', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('hints_used', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('weak_topics', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('last_activity_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id')
    )
    op.create_index(op.f('ix_dsa_progress_id'), 'dsa_progress', ['id'], unique=False)
    op.create_index(op.f('ix_dsa_progress_student_id'), 'dsa_progress', ['student_id'], unique=True)

def downgrade():
    op.drop_table('dsa_progress')
    op.drop_table('dsa_problems')
    op.drop_table('dsa_algorithms')
    op.drop_table('dsa_topics')
