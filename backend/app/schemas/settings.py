from pydantic import BaseModel, ConfigDict


class SLARuleBase(BaseModel):
    priority: str
    response_target: str
    resolution_target: str
    response_minutes: int | None = None
    resolution_minutes: int | None = None


class SLARuleCreate(SLARuleBase):
    pass


class SLARuleUpdate(BaseModel):
    priority: str | None = None
    response_target: str | None = None
    resolution_target: str | None = None
    response_minutes: int | None = None
    resolution_minutes: int | None = None


class SLARuleOut(SLARuleBase):
    id: str

    model_config = ConfigDict(from_attributes=True)


class CategoryBase(BaseModel):
    name: str
    description: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class CategoryOut(CategoryBase):
    id: str

    model_config = ConfigDict(from_attributes=True)


class DepartmentBase(BaseModel):
    name: str
    code: str | None = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: str | None = None
    code: str | None = None


class DepartmentOut(DepartmentBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
