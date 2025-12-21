export async function sendContactMessage(form) {
    const formData = new FormData();
    formData.append("access_key", "af6ba084-3051-46e0-a459-db8c9762c013");
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("subjectType", form.subjectType);
    formData.append("message", form.message);

    const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    if (!data.success) {
        throw new Error("Failed to send contact message");
    }

    return data;
}


