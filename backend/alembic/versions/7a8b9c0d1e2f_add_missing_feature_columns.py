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


def upgrade() -> None:
    # 1. users
    op.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_work_queue VARCHAR(50);')

    # 2. shopkeeper_profiles
    op.execute("ALTER TABLE shopkeeper_profiles ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED';")
    op.execute('ALTER TABLE shopkeeper_profiles ADD COLUMN IF NOT EXISTS verification_notes TEXT;')
    op.execute('ALTER TABLE shopkeeper_profiles ADD COLUMN IF NOT EXISTS credit_limit_reason TEXT;')
    op.execute('ALTER TABLE shopkeeper_profiles ADD COLUMN IF NOT EXISTS notification_preferences VARCHAR(255) DEFAULT \'{"in_app":true,"sms":false,"whatsapp":true}\';')

    # 3. products
    op.execute('ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(50);')

    # 4. stock_batches
    op.execute("ALTER TABLE stock_batches ADD COLUMN IF NOT EXISTS rack_location VARCHAR(50) DEFAULT 'Rack A - Bay 01';")
    op.execute('ALTER TABLE stock_batches ADD COLUMN IF NOT EXISTS barcode VARCHAR(50);')

    # 5. orders
    op.execute('ALTER TABLE orders ADD COLUMN IF NOT EXISTS rating INTEGER;')
    op.execute('ALTER TABLE orders ADD COLUMN IF NOT EXISTS feedback_text TEXT;')

    # 6. order_items
    op.execute('ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_picked BOOLEAN NOT NULL DEFAULT FALSE;')
    op.execute('ALTER TABLE order_items ADD COLUMN IF NOT EXISTS barcode_verified BOOLEAN NOT NULL DEFAULT FALSE;')

    # 7. delivery_assignments
    op.execute('ALTER TABLE delivery_assignments ADD COLUMN IF NOT EXISTS delivery_otp VARCHAR(6);')
    op.execute('ALTER TABLE delivery_assignments ADD COLUMN IF NOT EXISTS cash_collected NUMERIC(12, 2) NOT NULL DEFAULT 0.0;')
    op.execute('ALTER TABLE delivery_assignments ADD COLUMN IF NOT EXISTS upi_collected NUMERIC(12, 2) NOT NULL DEFAULT 0.0;')
    op.execute('ALTER TABLE delivery_assignments ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100);')
    op.execute('ALTER TABLE delivery_assignments ADD COLUMN IF NOT EXISTS failure_reason VARCHAR(50);')
    op.execute('ALTER TABLE delivery_assignments ADD COLUMN IF NOT EXISTS failure_photo_url VARCHAR(500);')


def downgrade() -> None:
    pass
