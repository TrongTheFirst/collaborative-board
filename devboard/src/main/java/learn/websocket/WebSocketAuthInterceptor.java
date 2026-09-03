package learn.websocket;

import learn.security.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;

@Configuration
@AllArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                try {
                    long realUserId = jwtUtil.extractUserId(token.substring(7));

                    if (accessor.getSessionAttributes() == null) {
                        accessor.setSessionAttributes(new java.util.concurrent.ConcurrentHashMap<>());
                    }
                    accessor.getSessionAttributes().put("userId", realUserId);

                } catch (Exception e) {
                    //anonymous board
                }
            }
        }
        return message;
    }
}
