import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { gsap } from "@/lib/gsap";
import { POINTS } from "@/data/film";
import { kestrelAssets } from "@/assets/kestrel/assets";

type Errors = Partial<Record<"arrival" | "departure" | "guests" | "email", string>>;

export default function BookStay() {
  const rootRef = useRef<HTMLElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(".book__lantern", { y: 60, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, ease: "none",
          scrollTrigger: { trigger: rootRef.current, start: "top 90%", end: "top 35%", scrub: 1 },
        });
        gsap.fromTo(".book__pulse", { opacity: 0.7, scale: 0.95 }, { opacity: 1, scale: 1.05, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
        gsap.fromTo(".book__reveal", { y: 28, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 1, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: ".book__copy", start: "top 85%", once: true },
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const arrival = String(f.get("arrival") || "");
    const departure = String(f.get("departure") || "");
    const guests = String(f.get("guests") || "");
    const email = String(f.get("email") || "");
    const next: Errors = {};
    if (!arrival) next.arrival = "Choose your arrival date.";
    if (!departure) next.departure = "Choose your departure date.";
    else if (arrival && departure <= arrival) next.departure = "Departure must be after arrival.";
    if (!guests) next.guests = "Choose the number of guests.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter an email address like name@example.com.";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSent(true);
      e.currentTarget.reset();
    }
  }

  return (
    <section ref={rootRef} id="book" className="book" aria-labelledby="book-title">
      <div className="book__lantern" aria-hidden="true">
        <div className="book__pulse" />
        <img
          src={kestrelAssets.hand}
          alt=""
          style={{ transform: `translate(-${POINTS.flame.x}%, -${POINTS.flame.y}%)` }}
        />
      </div>

      <div className="book__copy">
        <p className="book__label book__reveal"><span className="book__rule" />06 — Stay with us</p>
        <h2 id="book-title" className="book__title book__reveal">We'll keep a light <em>on</em>.</h2>
        <p className="book__body book__reveal">Tell us your dates and we'll write back within a day with availability and the best way up.</p>
      </div>

      {sent ? (
        <p className="book__thanks" role="status">Thank you. We'll write back within a day.</p>
      ) : (
        <form className="book__form book__reveal" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="arrival">Arrival</label>
            <input id="arrival" name="arrival" type="date" aria-invalid={!!errors.arrival} aria-describedby="arrival-err" />
            {errors.arrival && <p id="arrival-err" className="field__err">{errors.arrival}</p>}
          </div>
          <div className="field">
            <label htmlFor="departure">Departure</label>
            <input id="departure" name="departure" type="date" aria-invalid={!!errors.departure} aria-describedby="departure-err" />
            {errors.departure && <p id="departure-err" className="field__err">{errors.departure}</p>}
          </div>
          <div className="field">
            <label htmlFor="guests">Guests</label>
            <select id="guests" name="guests" defaultValue="" aria-invalid={!!errors.guests} aria-describedby="guests-err">
              <option value="" disabled>Select</option>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            {errors.guests && <p id="guests-err" className="field__err">{errors.guests}</p>}
          </div>
          <div className="field field--wide">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby="email-err" />
            {errors.email && <p id="email-err" className="field__err">{errors.email}</p>}
          </div>
          <button className="book__submit" type="submit">Check availability</button>
        </form>
      )}
    </section>
  );
}
