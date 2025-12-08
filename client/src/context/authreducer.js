export const AuthReducer =
    (
        state = {
            user: localStorage.getItem("user") || null,
            token: localStorage.getItem("token") || null,
        },
        action
    ) => {
        switch (action.type) {
            case "LOGIN":
                localStorage.setItem("user", JSON.stringify(action.payload.user));
                localStorage.setItem("token", action.payload.token);
                return {
                    ...state,
                    user: action.payload.user,
                    token: action.payload.token,
                }
            case "LOGOUT":
                localStorage.removeItem("_pouch_check_localstorage");
                localStorage.removeItem("notification_history");
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                return {
                    ...state,
                    user: null,
                    token: null,
                }
            default:
                return state;
        }
    }