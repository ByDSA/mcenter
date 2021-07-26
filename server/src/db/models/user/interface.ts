import { GroupInterface } from "../group";
import { HistoryInterface } from "../history";
import { TimestampInterface } from "../timestamp";

export type Role = "Admin" | "Guest" | "User";

export default interface Interface extends TimestampInterface {
    name: string;
    role: Role;
    pass: string;
    groups?: GroupInterface[];
    histories?: HistoryInterface[];
}
