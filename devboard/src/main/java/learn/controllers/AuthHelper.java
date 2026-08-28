package learn.controllers;

import learn.data.DataAccessException;
import learn.domain.UserService;
import learn.models.User;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class AuthHelper {
    private UserService userService;

    public User getUserFromAuth(Authentication auth) throws DataAccessException {
        User user = null;
        if(auth != null) {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            user = userService.findByEmail(userDetails.getUsername());
        }
        return user;
    }

    public boolean boardOwnerExistsAndAuthUserIsNotTheSame(long ownerId, Authentication auth) throws DataAccessException {
        User user = getUserFromAuth(auth);
        return user!=null
                && ownerId != 0
                && ownerId != user.getId();
    }
}
