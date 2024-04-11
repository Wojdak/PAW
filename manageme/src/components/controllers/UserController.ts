import { User } from "../models/UserModel";

export class UserController {

    static getLoggedInUser(): User {
        const user: User = { id: "1", firstName: "Jan", lastName: "Kowalski" };
        return user;
    }

}
