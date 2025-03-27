import { ValidationOptions } from 'class-validator';
import { Body, Controller, Delete, Get, InternalServerErrorException, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from '../users.service';
import { CustomLoggerService } from 'src/common-modules/custom-logger/custom-logger.service';
import { UserWithRelations } from 'src/helper/custom-types';
import { UserProfileDto } from 'src/common-modules/common-dto/user-profile.dto';
import { UserProfileUpdateDto } from '../dtos/user-profile-update.dto';
import { ValidResponse } from 'src/helper/valid-response';
import { UserChangePasswordDTO } from '../dtos/user-change-password.dto';

@ApiTags('Users - Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileManagementController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Get()
  async getProfile() {
    const authUser: UserWithRelations = await this.usersService.authUser();
    return  new ValidResponse("Sucessful", new UserProfileDto(authUser)) 
  }

  
  @Patch('/update')
  async update(
    @Body()
    updateUserDto: UserProfileUpdateDto,
  ): Promise<ValidResponse<UserProfileDto>> {
    const authUser = await this.usersService.authUser();
    if (updateUserDto.phone) {
      await this.usersService.validateUniquePhoneNumber(
        authUser,
        updateUserDto.phone,
      );
    }

   const data = new UserProfileDto( await this.usersService.updateAnyUserType(authUser, updateUserDto)) 
  
    return new ValidResponse("Update successful", data);
  }

  @Patch('/change-password')
  async changePassword(@Body() changePasswordDto: UserChangePasswordDTO) {
    return new ValidResponse(
      'Password changed Successfully',
      new UserProfileDto(
        await this.usersService.changePassword(changePasswordDto),
      ),
    );
  }

  @Delete('/delete-account')
  async deleteProfile() {
    const authUser = await this.usersService.authUser();
    const deletedUser = await this.usersService.update(authUser.id, {
      deletedAt: new Date(),
    });
    if (deletedUser.deletedAt) {
      return new ValidResponse('Your account has been deleted successfully!!');
    }
    this.logger.error(
      'The deleted at field was not set: ' +
        JSON.stringify({
          authUserId: authUser.id,
        }),
    );
    throw new InternalServerErrorException(
      'Account deletion failed: please contact an administrator',
    );
  }
}
