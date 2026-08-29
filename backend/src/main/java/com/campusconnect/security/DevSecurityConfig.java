package com.campusconnect.security;

import com.campusconnect.users.ProfileRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@ConditionalOnProperty(name = "app.auth.mode", havingValue = "dev", matchIfMissing = true)
public class DevSecurityConfig {

    @Bean
    public SecurityFilterChain devFilterChain(HttpSecurity http,
                                              @Qualifier("corsConfigurationSource") CorsConfigurationSource cors,
                                              ProfileRepository profileRepository) throws Exception {
        http
                .cors(c -> c.configurationSource(cors))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(SecurityConfig.PUBLIC_PATHS).permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(new DevAuthFilter(profileRepository), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
