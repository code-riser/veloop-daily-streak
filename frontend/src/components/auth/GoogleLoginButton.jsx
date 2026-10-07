import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getApiMessage } from "../../services/api";

export default function GoogleLoginButton() {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  const buttonRef = useRef(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      setError("Google Sign-In is not configured.");
      return;
    }

    const renderButton = () => {
      if (!window.google || !buttonRef.current) {
        return;
      }

      buttonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: clientId,

        callback: async (response) => {
          if (!response?.credential) {
            setError("Google authentication failed.");
            return;
          }

          setError("");
          setLoading(true);

          try {
            await googleLogin(response.credential);

            navigate("/daily-streak", {
              replace: true,
            });
          } catch (err) {
            setError(
              getApiMessage(
                err,
                "Unable to sign in with Google."
              )
            );
          } finally {
            setLoading(false);
          }
        },
      });

      window.google.accounts.id.renderButton(
        buttonRef.current,
        {
          theme: "outline",
          size: "large",
          width: Math.min(380, buttonRef.current.clientWidth || 380),
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
        }
      );
    };

    if (window.google) {
      renderButton();
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        renderButton
      );

      return () => {
        existingScript.removeEventListener(
          "load",
          renderButton
        );
      };
    }

    const script = document.createElement("script");

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload = renderButton;

    document.head.appendChild(script);
  }, [clientId, googleLogin, navigate]);

  return (
    <div>
      <div
        ref={buttonRef}
        style={{
          minHeight: "44px",
          display: "flex",
          justifyContent: "center",
        }}
      />

      {loading && (
        <p
          style={{
            textAlign: "center",
            marginTop: "10px",
            fontSize: "13px",
          }}
        >
          Signing in with Google...
        </p>
      )}

      {error && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px 12px",
            borderRadius: "10px",
            background: "#ef44441a",
            color: "#ff9b9b",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}