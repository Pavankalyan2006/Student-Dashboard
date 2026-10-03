"""documents schema

Revision ID: 002_documents_schema
Revises: 001_initial_schema
Create Date: 2026-10-01 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '002_documents_schema'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None

def upgrade():
    # 1. documents table
    op.create_table(
        'documents',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('file_extension', sa.String(length=20), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('storage_key', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='UPLOADING'),
        sa.Column('page_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('author', sa.String(length=255), nullable=True),
        sa.Column('language', sa.String(length=20), nullable=False, server_default='en'),
        sa.Column('metadata', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('is_favorite', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('last_opened_at', sa.DateTime(), nullable=False),
        sa.Column('processing_started_at', sa.DateTime(), nullable=True),
        sa.Column('processing_completed_at', sa.DateTime(), nullable=True),
        sa.Column('processing_error', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_id'), 'documents', ['id'], unique=False)
    op.create_index(op.f('ix_documents_student_id'), 'documents', ['student_id'], unique=False)
    op.create_index(op.f('ix_documents_status'), 'documents', ['status'], unique=False)
    op.create_index(op.f('ix_documents_created_at'), 'documents', ['created_at'], unique=False)

    # 2. document_pages table
    op.create_table(
        'document_pages',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('document_id', sa.String(length=64), nullable=False),
        sa.Column('page_number', sa.Integer(), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('document_id', 'page_number', name='uq_document_page_number')
    )
    op.create_index(op.f('ix_document_pages_id'), 'document_pages', ['id'], unique=False)
    op.create_index(op.f('ix_document_pages_document_id'), 'document_pages', ['document_id'], unique=False)

    # 3. document_chunks table
    op.create_table(
        'document_chunks',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('document_id', sa.String(length=64), nullable=False),
        sa.Column('page_id', sa.String(length=64), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('token_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('metadata', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('embedding_reference', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['page_id'], ['document_pages.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_document_chunks_id'), 'document_chunks', ['id'], unique=False)
    op.create_index(op.f('ix_document_chunks_document_id'), 'document_chunks', ['document_id'], unique=False)
    op.create_index(op.f('ix_document_chunks_page_id'), 'document_chunks', ['page_id'], unique=False)

    # 4. document_summaries table
    op.create_table(
        'document_summaries',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('document_id', sa.String(length=64), nullable=False),
        sa.Column('student_id', sa.String(length=64), nullable=False),
        sa.Column('summary_level', sa.String(length=32), nullable=False, server_default='standard'),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('overview', sa.Text(), nullable=False),
        sa.Column('main_topics', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('key_concepts', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('important_points', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('exam_points', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('definitions', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('formulas', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('conclusion', sa.Text(), nullable=False),
        sa.Column('page_range', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_document_summaries_id'), 'document_summaries', ['id'], unique=False)
    op.create_index(op.f('ix_document_summaries_document_id'), 'document_summaries', ['document_id'], unique=False)
    op.create_index(op.f('ix_document_summaries_student_id'), 'document_summaries', ['student_id'], unique=False)

def downgrade():
    op.drop_table('document_summaries')
    op.drop_table('document_chunks')
    op.drop_table('document_pages')
    op.drop_table('documents')
