from __future__ import annotations

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class BaseSchema(BaseModel):
    """Pydantic base that speaks camelCase on the wire.

    The frontend sends and reads camelCase (categoryId, resetTime, isPinned,
    ...). By generating camelCase aliases we accept that input and emit it in
    responses, while still populating from snake_case ORM attributes.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
