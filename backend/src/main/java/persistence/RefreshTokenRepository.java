package persistence;

import entity.RefreshToken;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class RefreshTokenRepository implements PanacheRepository<RefreshToken> {

    @Transactional
    public long deleteByUserId(Long userid){
        return delete("userid", userid);
    }

}
