"""add_missing_feature_columns

Revision ID: 7a8b9c0d1e2f
Revises: 4e76a82e78f6
Create Date: 2026-10-20 05:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a8b9c0d1e2f'
down_revision: Union[str, None] = '4e76a82e78f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def add_column_if_not_exists(table_name: str, column: sa.Column) -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = [c["name"] for c in inspector.get_columns(table_name)]
    if column.name not in existing_columns:
        op.add_column(table_name, column)


def upgrade() -> None:
    # 1. users
    add_column_if_not_exists('users', sa.Column('assigned_work_queue', sa.String(50), nullable=True))

    # 2. shopkeeper_profiles
    add_column_if_not_exists('shopkeeper_profiles', sa.Column('verification_status', sa.String(50), nullable=False, server_default='VERIFIED'))
    add_column_if_not_exists('shopkeeper_profiles', sa.Column('verification_notes', sa.Text(), nullable=True))
    add_column_if_not_exists('shopkeeper_profiles', sa.Column('credit_limit_reason', sa.Text(), nullable=True))
    add_column_if_not_exists('shopkeeper_profiles', sa.Column('notification_preferences', sa.String(255), nullable=True, server_default='{"in_app":true,"sms":false,"whatsapp":true}'))

    # 3. products
    add_column_if_not_exists('products', sa.Column('barcode', sa.String(50), nullable=True))

    # 4. stock_batches
    add_column_if_not_exists('stock_batches', sa.Column('rack_location', sa.String(50), nullable=True, server_default='Rack A - Bay 01'))
    add_column_if_not_exists('stock_batches', sa.Column('barcode', sa.String(50), nullable=True))

    # 5. orders
    add_column_if_not_exists('orders', sa.Column('rating', sa.Integer(), nullable=True))
    add_column_if_not_exists('orders', sa.Column('feedback_text', sa.Text(), nullable=True))

    # 6. order_items
    add_column_if_not_exists('order_items', sa.Column('is_picked', sa.Boolean(), nullable=False, server_default=sa.false()))
    add_column_if_not_exists('order_items', sa.Column('barcode_verified', sa.Boolean(), nullable=False, server_default=sa.false()))

    # 7. delivery_assignments
    add_column_if_not_exists('delivery_assignments', sa.Column('delivery_otp', sa.String(6), nullable=True))
    add_column_if_not_exists('delivery_assignments', sa.Column('cash_collected', sa.Numeric(12, 2), nullable=False, server_default='0.0'))
    add_column_if_not_exists('delivery_assignments', sa.Column('upi_collected', sa.Numeric(12, 2), nullable=False, server_default='0.0'))
    add_column_if_not_exists('delivery_assignments', sa.Column('payment_reference', sa.String(100), nullable=True))
    add_column_if_not_exists('delivery_assignments', sa.Column('failure_reason', sa.String(50), nullable=True))
    add_column_if_not_exists('delivery_assignments', sa.Column('failure_photo_url', sa.String(500), nullable=True))


def downgrade() -> None:
    pass
