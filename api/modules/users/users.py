
import re
from typing import Any, Optional
from uuid import UUID

from fastapi import HTTPException

from config.permissions_config import PERMISSIONS
from config.regex_config import REGEX_CONFIG
from modules.authentication.passwords import hash_password
from modules.users.permissions import verify_can_change_password, verify_permissions
from modules.users.sublibraries.roles_library import RoleLibrary
from modules.users.sublibraries.group_library import GroupLibrary
from modules.users.sublibraries.client_library import ClientLibrary
from modules.users.sublibraries.administrator_library import AdministratorLibrary
from modules.users.validation import validate_group_creation, validate_user_creation, validate_user_modification
from .models import Administrator, AnyUser, AnyUserExtended, CreateAdministratorArgs, CreateAnyUserForm, CreateClientArgs, CreateGroupArgs, CreateGroupForm, GetUsersFilters, ModifyUserArgs, ModifyUserForm


class _UsersSystemManager():
    
    def get_user(self, uuid: UUID) -> Optional[AnyUser]:
        return AdministratorLibrary.get_record_by_uuid(uuid) or ClientLibrary.get_record_by_uuid(uuid)
    
    def get_user_by_username(self, username: str) -> Optional[AnyUser]:
        return AdministratorLibrary.get_record_by_field("username", username) or ClientLibrary.get_record_by_field("username", username)
    
    def get_user_by_email(self, email: str) -> Optional[AnyUser]:
        return AdministratorLibrary.get_record_by_field("email", email) or ClientLibrary.get_record_by_field("email", email)
    
    def get_user_password(self, uuid: UUID) -> Optional[str]:
        return AdministratorLibrary.get_password(uuid) or ClientLibrary.get_password(uuid)
    
    def get_users(self, filters: GetUsersFilters) -> dict[UUID, AnyUser]:
        users: dict[UUID, AnyUser] = {}
        
        if filters.role is not None and filters.group is not None:
            return {}
            
        if filters.account_type in (None, "administrative") and filters.group is None:
            if filters.role is None:
                users |= AdministratorLibrary.get_all_records()
            else:
                users |= AdministratorLibrary.get_all_administrators_with_role(filters.role)

        if filters.account_type in (None, "client") and filters.role is None:
            if filters.group is None:
                users |= ClientLibrary.get_all_records()
            else:
                users |= ClientLibrary.get_all_clients_in_group(filters.group)
        
        return users
    
    def extend_user_model(self, user: AnyUser) -> AnyUserExtended:
        if user.account_type == 'administrative':
            return AdministratorLibrary.extend_model(user)
        if user.account_type == 'client':
            return ClientLibrary.extend_model(user)
    
    def create_user(self, form: CreateAnyUserForm, logged_in_user: Administrator) -> UUID:
        validate_user_creation(form)
        
        if form.account_type == 'administrative':
            verify_permissions(logged_in_user, PERMISSIONS.MANAGE_ADMIN_USERS)
        elif form.account_type == 'client':
            verify_permissions(logged_in_user, PERMISSIONS.MANAGE_CLIENT_USERS)
        
        if form.account_type == 'administrative':                       
            return AdministratorLibrary.create_record(CreateAdministratorArgs.model_validate(form.model_dump()), logged_in_user)
        if form.account_type == 'client':
            return ClientLibrary.create_record(CreateClientArgs.model_validate(form.model_dump()))
        
    def delete_user(self, uuid: UUID):
        user = self.get_user(uuid)
        
        if user is None:
            raise HTTPException(400, f"User with UUID={uuid} does not exist.")
        
        if user.account_type == 'administrative':
            return AdministratorLibrary.remove_record(uuid)
        if user.account_type == 'client':
            return ClientLibrary.remove_record(uuid)
        
    def modify_user(self, uuid: UUID, form: ModifyUserForm, logged_in_user: Administrator):
        user = self.get_user(uuid)
        
        if user is None:
            raise HTTPException(400, f"User with UUID={uuid} does not exist.")
        
        if user.account_type == 'administrative':
            verify_permissions(logged_in_user, PERMISSIONS.MANAGE_ADMIN_USERS)
        elif user.account_type == 'client':
            verify_permissions(logged_in_user, PERMISSIONS.MANAGE_CLIENT_USERS)
        
        validate_user_modification(uuid, form)
        
        args = ModifyUserArgs.model_validate(form.model_dump())
        
        if user.account_type == 'administrative':
            if form.roles: 
                RoleLibrary.update_administrator_roles(uuid, form.roles, logged_in_user)
                
            AdministratorLibrary.modify_record(uuid, args)
        
        elif user.account_type == 'client':
            if form.groups: 
                GroupLibrary.update_client_groups(uuid, form.groups)
            
            ClientLibrary.modify_record(uuid, args)
        
        return uuid
        
    def change_password(self, uuid: UUID, new_password: str, logged_in_user: Administrator):
        user = self.get_user(uuid)
        
        if user is None:
            raise HTTPException(400, f"User with UUID={uuid} does not exist.")
        
        if not re.match(REGEX_CONFIG.password, new_password):
            raise HTTPException(status_code=400, detail="Invalid password. Password must be at least 12 characters long and contain at least one digit, lowercase letter, upercase letter and one of the special characters.") 
    
        verify_can_change_password(logged_in_user, user)
    
        hashed_password = hash_password(new_password)
    
        if user.account_type == 'administrative':
            return AdministratorLibrary.change_password(uuid, hashed_password)
        if user.account_type == 'client':
            return ClientLibrary.change_password(uuid, hashed_password)
        
    def update_user_last_active(self, logged_in_user: AnyUser):
        if logged_in_user.account_type == 'administrative':
            return AdministratorLibrary.update_last_active(logged_in_user.uuid)
        if logged_in_user.account_type == 'client':
            return ClientLibrary.update_last_active(logged_in_user.uuid)
        
    def create_group(self, form: CreateGroupForm) -> UUID:
        validate_group_creation(form)
        
        return GroupLibrary.create_record(CreateGroupArgs.model_validate(form.model_dump()))

    
UsersManager = _UsersSystemManager()

__all__ = ["UsersManager"]