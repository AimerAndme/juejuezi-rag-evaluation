from pydantic import BaseModel


class EvaluationData(BaseModel):
    name: str
    age: int
    email: str
