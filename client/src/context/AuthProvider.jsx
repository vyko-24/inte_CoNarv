"use clients";

import { useReducer } from "react";
import { AuthReducer } from "./authreducer";
import AuthContext from "./authcontext";

const init = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    return {
        token: token ? token : null,
        user: user ? JSON.parse(user) : null,
    }
};

const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, {}, init);

    return (
        <AuthContext.Provider
            value={{ user: state.user, token: state.token, dispatch }}
        >
            {children}
        </AuthContext.Provider>
    )
};

export default AuthProvider;