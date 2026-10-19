"""
Strawberry GraphQL schema — root Query and Mutation.
"""

import strawberry

from app.graphql.resolvers.auth import AuthMutation, AuthQuery
from app.graphql.resolvers.products import ProductQuery, ProductMutation
from app.graphql.resolvers.orders import OrderQuery, OrderMutation
from app.graphql.resolvers.delivery import DeliveryQuery, DeliveryMutation
from app.graphql.resolvers.challan import ChallanQuery, ChallanMutation
from app.graphql.resolvers.returns import ReturnQuery, ReturnMutation
from app.graphql.resolvers.payments import PaymentQuery, PaymentMutation
from app.graphql.resolvers.ledger import LedgerQuery, LedgerMutation
from app.graphql.resolvers.notifications import NotificationQuery, NotificationMutation
from app.graphql.resolvers.ops_automation import OpsAutomationQuery, OpsAutomationMutation
from app.graphql.resolvers.superadmin_governance import (
    SuperAdminGovernanceQuery,
    SuperAdminGovernanceMutation,
)
from app.graphql.resolvers.warehouse_ops import (
    WarehouseOpsQuery,
    WarehouseOpsMutation,
)


@strawberry.type
class Query(
    AuthQuery,
    ProductQuery,
    OrderQuery,
    DeliveryQuery,
    ChallanQuery,
    ReturnQuery,
    PaymentQuery,
    LedgerQuery,
    NotificationQuery,
    OpsAutomationQuery,
    SuperAdminGovernanceQuery,
    WarehouseOpsQuery,
):
    """Root GraphQL Query combining all domain queries."""
    pass


@strawberry.type
class Mutation(
    AuthMutation,
    ProductMutation,
    OrderMutation,
    DeliveryMutation,
    ChallanMutation,
    ReturnMutation,
    PaymentMutation,
    LedgerMutation,
    NotificationMutation,
    OpsAutomationMutation,
    SuperAdminGovernanceMutation,
    WarehouseOpsMutation,
):
    """Root GraphQL Mutation combining all domain mutations."""
    pass


schema = strawberry.Schema(query=Query, mutation=Mutation)
