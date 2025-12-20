export function getUserInfo() {
  if (typeof window === "undefined") {
    return { name: "User", initials: "U" };
  }

  try {
    const stored = localStorage.getItem("igs_user");
    const userData = stored ? JSON.parse(stored) : {};
    const user = userData.profile || userData || {};

    const first = user.firstName || "";
    const last = user.lastName || "";
    const displayName =
      [first, last].filter(Boolean).join(" ") ||
      user.name ||
      user.displayName ||
      user.email ||
      "User";

    const initials = displayName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

    return { name: displayName, initials };
  } catch (err) {
    console.error("Failed to read user info:", err);
    return { name: "User", initials: "U" };
  }
}

