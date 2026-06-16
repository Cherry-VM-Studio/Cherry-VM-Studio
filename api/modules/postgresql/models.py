from uuid import UUID


Params = tuple | list | dict



class InvalidFieldNameException(Exception):
    def __init__(self, field_name: str, **args):
        self.field_name = field_name
        super().__init__(args)



class RecordNotFoundException(Exception):
    
    def __init__(self, uuid: UUID, **args):
        self.uuid = uuid
        super().__init__(args)