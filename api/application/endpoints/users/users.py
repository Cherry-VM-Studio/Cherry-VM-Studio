from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from modules.websockets.websocket_manager import GlobalWebSocketManager
from modules.users.permissions import is_admin
from modules.users.models import AccountType, AnyUserExtended, ChangePasswordBody, CreateAnyUserForm, GetUsersFilters, ModifyUserForm
from modules.users.users import UsersManager
from modules.authentication.validation import DependsOnAdministrativeAuthentication, DependsOnAuthentication, get_authenticated_user

router = APIRouter(
    prefix='/users',
    tags=['Users'],
    dependencies=[Depends(get_authenticated_user)]
)

@router.get("/me", response_model=AnyUserExtended)
async def __read_logged_in_user__(current_user: DependsOnAuthentication) -> AnyUserExtended:
    return current_user

@router.get("/me/permissions", response_model=int)
async def __read_logged_in_users_permissions__(current_user: DependsOnAuthentication) -> int:
    return current_user.permissions if is_admin(current_user) else -1

@router.get("/user/{uuid}", response_model=AnyUserExtended)
async def __read_user__(uuid: UUID) -> AnyUserExtended:
    user = UsersManager.get_user(uuid)
    if user is None: 
        raise HTTPException(400, f"User with UUID={uuid} does not exist.")
    return UsersManager.extend_user_model(user)


@router.get("/all", response_model=dict[UUID, AnyUserExtended])
async def __read_users__(
    account_type: AccountType | None = None,
    group: UUID | None = None,
    role: UUID | None = None,
):
    filters = GetUsersFilters(account_type=account_type, group=group, role=role)
    
    users = UsersManager.get_users(filters)
    
    for uuid, user in users.items():
        users[uuid] = UsersManager.extend_user_model(user)
    
    return JSONResponse(content=jsonable_encoder(users))


@router.post("/create", response_model=UUID)
async def __create_user__(form: CreateAnyUserForm, current_user: DependsOnAdministrativeAuthentication) -> UUID:   
    return UsersManager.create_user(form, current_user)


@router.put("/change-password/{uuid}", response_model=None)
async def __change_password__(uuid: UUID, body: ChangePasswordBody, current_user: DependsOnAdministrativeAuthentication) -> None:
    return UsersManager.change_password(uuid, body.password, current_user)


@router.put("/modify/{uuid}", response_model=UUID)
async def __modify_user__(uuid: UUID, form: ModifyUserForm, current_user: DependsOnAdministrativeAuthentication) -> UUID:
    return UsersManager.modify_user(uuid, form, current_user)
    
    
@router.delete("/delete/{uuid}", response_model=None )
async def __delete_user__(uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> None:
    UsersManager.delete_user(uuid)
    await GlobalWebSocketManager.disconnect_user(uuid, 4403, "User account got deleted.")
    
        