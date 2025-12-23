import { useEffect } from "react";
import Cookies from "js-cookie";

export default function IndexPage() {
  const access = Cookies.get("user")
    ? JSON.parse(Cookies.get("user")).accessToken
    : null;

  useEffect(() => {
    if (access) {
      window.location.href = "/members";
    } else {
      window.location.href = "/login";
    }
  });

  return <></>;
}
