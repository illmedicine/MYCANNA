import { useEffect, useRef, useState } from "react";

const CLIENT_ID =
  "BAACVz29C_Abgp2SNMII6zRix5largq7DDTUc1DNnG49p8LQOw2ClZGqRlnURBmpOWkkph_8zKeWIut-jw";

// Map tier to hosted button ID — add more as PayPal buttons are created
export const PAYPAL_BUTTONS = {
  standard: "KW6ZX5ZZCZ7XA",
  premium: "2RLRRERUZLA82",
};

export default function PayPalButton({ hostedButtonId, label }) {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const containerId = `paypal-container-${hostedButtonId}`;

  useEffect(() => {
    if (!hostedButtonId) return;

    const render = () => {
      if (window.paypal && containerRef.current) {
        containerRef.current.innerHTML = "";
        containerRef.current.id = containerId;
        try {
          window.paypal.HostedButtons({ hostedButtonId }).render(`#${containerId}`);
          setLoaded(true);
        } catch (e) {
          setError(true);
        }
      }
    };

    if (window.paypal) {
      render();
    } else {
      const existing = document.getElementById("paypal-sdk");
      if (existing) {
        existing.addEventListener("load", render);
        return;
      }
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&components=hosted-buttons&enable-funding=venmo&currency=USD`;
      script.onload = render;
      script.onerror = () => setError(true);
      document.head.appendChild(script);
    }
  }, [hostedButtonId, containerId]);

  if (!hostedButtonId) {
    return (
      <div className="paypal-unavailable">
        <span>💳</span> Payment for this tier coming soon — contact us to upgrade.
      </div>
    );
  }

  if (error) {
    return (
      <div className="paypal-unavailable">
        <span>⚠️</span> Payment could not load. Please refresh or contact support.
      </div>
    );
  }

  return (
    <div className="paypal-wrap">
      {label && <p className="paypal-label">{label}</p>}
      <div ref={containerRef} id={containerId} className="paypal-container" />
    </div>
  );
}
