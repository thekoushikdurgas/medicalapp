"""
Strawberry GraphQL schema — root Query and Mutation.
"""

import strawberry

from app.graphql.resolvers.auth import AuthMutation, AuthQuery
from app.graphql.resolvers.products import ProductQuery, ProductMutation
from app.graphql.resolvers.orders import OrderQuery, OrderMutation
from app.graphql.resolvers.delivery import DeliveryQuery, DeliveryMutation


@strawberry.type
class Query(AuthQuery, ProductQuery, OrderQuery, DeliveryQuery):
    """Root GraphQL Query combining all domain queries."""
    pass


@strawberry.type
class Mutation(AuthMutation, ProductMutation, OrderMutation, DeliveryMutation):
    """Root GraphQL Mutation combining all domain mutations."""
    pass


schema = strawberry.Schema(query=Query, mutation=Mutation)
