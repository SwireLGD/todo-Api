export interface UserFields {
    username: string;
    password: string;
    token: string;
}

export interface TaskMutation {
    user: Types.ObjectId | string;
    title: string;
    description?: string;
}

interface UserMethods {
    checkPassword(password: string): Promise<boolean>;
    generateToken(): void;
}

type UserModel = Model<UserFields, {}, UserMethods>;