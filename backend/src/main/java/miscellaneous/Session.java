package miscellaneous;


import io.quarkus.hibernate.orm.panache.PanacheEntity;

public class Session {

    public  String accessToken;

    public String refreshToken;

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public void setRefreshToken(String refreshToken){
        this.refreshToken = refreshToken;
    }

    @Override
    public String toString() {
        return "Session{" +
                "refreshToken='" + refreshToken + '\'' +
                ", accessToken='" + accessToken + '\'' +
                '}';
    }
}
