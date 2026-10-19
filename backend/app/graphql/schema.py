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


@strawberry.type
class Query(
    AuthQuery,
    ProductQuery,
    OrderQuery,
    DeliveryQuery,
    ChallanQuery,
    ReturnQuery,
    PaymentQuery,
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
):
    """Root GraphQL Mutation combining all domain mutations."""
    pass


schema = strawberry.Schema(query=Query, mutation=Mutation)
