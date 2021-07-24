import { GroupInterface } from "../group";
import { TimestampInterface } from "../timestamp";

export type Role = "Admin" | "Guest" | "User";

export default interface UserInterface extends TimestampInterface {
    name: string;
    role: Role;
    pass: string;
    groups?: GroupInterface[];
}
