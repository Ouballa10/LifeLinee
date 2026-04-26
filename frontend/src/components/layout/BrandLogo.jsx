import { classNames } from "../../utils/helpers.js";
import logoImage from "../../assets/logo.png";

export default function BrandLogo({ size = "compact", center = false, className = "" }) {
  return (
    <span
      className={classNames(
        "life-brand",
        `life-brand-${size}`,
        center && "life-brand-center",
        className
      )}
    >
      <span className="life-brand-emblem" aria-hidden="true">
        <img src={logoImage} alt="" />
      </span>
      <span className="life-brand-text">LifeLine</span>
    </span>
  );
}
