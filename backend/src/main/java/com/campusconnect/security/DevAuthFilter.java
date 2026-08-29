package com.campusconnect.security;

import com.campusconnect.users.Profile;
import com.campusconnect.users.ProfileRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Development authentication: treats the {@code Authorization: Bearer <token>}
 * value as a Campus Connect profile id, looks it up, and installs a
 * {@link JwtAuthenticationToken} so downstream controllers using
 * {@code @AuthenticationPrincipal Jwt} keep working unchanged.
 *
 * Enabled only when {@code app.auth.mode=dev}. Never wire this in production.
 */
public class DevAuthFilter extends OncePerRequestFilter {

    private final ProfileRepository profileRepository;

    public DevAuthFilter(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            String token = header.substring(7).trim();
            String role = "ROLE_UNASSIGNED";

            Optional<Profile> profileOpt = profileRepository.findById(token);
            if (profileOpt.isPresent()) {
                Profile profile = profileOpt.get();
                role = Boolean.TRUE.equals(profile.getIsActive()) && !Boolean.TRUE.equals(profile.getIsDeleted())
                        ? "ROLE_" + profile.getRole().toUpperCase()
                        : "ROLE_BLOCKED";
            }

            Jwt jwt = Jwt.withTokenValue(token)
                    .header("alg", "none")
                    .subject(token)
                    .issuedAt(Instant.now())
                    .expiresAt(Instant.now().plusSeconds(3600))
                    .claim("sub", token)
                    .build();

            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));
            SecurityContextHolder.getContext().setAuthentication(
                    new JwtAuthenticationToken(jwt, authorities, token));
        }

        filterChain.doFilter(request, response);
    }
}
