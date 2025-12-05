export async function sendContactMessage(form) {
    // For now we use FormSubmit to send emails directly to the specified address.
    // In production you may want to replace this with your own backend API.
    const endpoint = "https://formsubmit.co/ajax/yashbagal2151@gmail.com";

    const data = new FormData();
    data.append("First Name", form.firstName);
    data.append("Last Name", form.lastName);
    data.append("Email", form.email);
    data.append("Phone", form.phone);
    data.append("Subject Type", form.subjectType);
    // data.append("Subject", form.subject || "");
    data.append("Message", form.message);

    // Optional: metadata for easier filtering
    data.append("_subject", "New contact from Ishita Gallery website");
    data.append("_template", "table");

    const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: {
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to send message");
    }

    return res.json().catch(() => ({}));
}


