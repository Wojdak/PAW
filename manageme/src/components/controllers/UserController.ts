import { User } from "../models/UserModel";

export class UserController {

    static getLoggedInUser() {
        return new User("1", "Test", "User");
    }

}
