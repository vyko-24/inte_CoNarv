package utez.camila.server.models.auth;


import utez.camila.server.models.user.User;

public class SignedDto {
    String token;
    String tokenType;
    User user;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public SignedDto(String token, String tokenType, User user) {
        this.token = token;
        this.tokenType = tokenType;
        this.user = user;
    }

}
