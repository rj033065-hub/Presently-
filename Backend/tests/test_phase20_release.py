import jwt
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SECRET_KEY = "test_secret_key"


def create_test_token(clerk_id: str, email: str = "test@example.com") -> str:
    payload = {"sub": clerk_id, "email": email}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def get_auth_headers(clerk_id: str, email: str = "test@example.com") -> dict:
    token = create_test_token(clerk_id, email)
    return {"Authorization": f"Bearer {token}", "x-skip-rate-limit": "true"}


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_readiness_endpoint():
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"


def test_security_headers_present():
    response = client.get("/health")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


def test_unauthenticated_request_rejected():
    endpoints = [
        "/api/v1/users/me",
        "/api/v1/wishlists",
        "/api/v1/planner",
        "/api/v1/notifications",
        "/api/v1/admin/dashboard",
    ]
    for ep in endpoints:
        res = client.get(ep)
        assert res.status_code == 401


def test_rbac_user_cannot_access_admin():
    headers = get_auth_headers("clerk_reg_user_1", "regular@example.com")
    res = client.get("/api/v1/admin/dashboard", headers=headers)
    assert res.status_code == 403


def test_survey_idor_protection():
    owner_headers = get_auth_headers("clerk_survey_owner_1", "owner1@example.com")
    attacker_headers = get_auth_headers("clerk_survey_attacker_1", "attacker1@example.com")

    # Owner creates a survey
    create_res = client.post(
        "/api/v1/surveys",
        json={"survey_payload": {"profile": {"name": "Alice"}}},
        headers=owner_headers,
    )
    assert create_res.status_code == 201
    survey_id = create_res.json()["id"]

    # Attacker attempts to read owner's survey
    read_res = client.get(f"/api/v1/surveys/{survey_id}", headers=attacker_headers)
    assert read_res.status_code == 403


def test_recommendation_idor_protection():
    owner_headers = get_auth_headers("clerk_rec_owner_1", "rec_owner1@example.com")
    attacker_headers = get_auth_headers("clerk_rec_attacker_1", "rec_attacker1@example.com")

    # Create survey & generate recommendation under owner
    create_res = client.post(
        "/api/v1/surveys",
        json={"survey_payload": {"profile": {"name": "Bob"}, "occasion": "Birthday"}},
        headers=owner_headers,
    )
    assert create_res.status_code == 201
    survey_id = create_res.json()["id"]

    gen_res = client.post(
        "/api/v1/recommendations/generate",
        json={"survey_id": survey_id, "force_regenerate": True},
        headers=owner_headers,
    )
    assert gen_res.status_code == 201
    rec_id = gen_res.json()["id"]

    # Attacker attempts to read owner's recommendation
    read_res = client.get(f"/api/v1/recommendations/{rec_id}", headers=attacker_headers)
    assert read_res.status_code == 403
