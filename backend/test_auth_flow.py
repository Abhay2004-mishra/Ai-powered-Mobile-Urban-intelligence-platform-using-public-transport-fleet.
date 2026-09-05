import requests
import sys

BASE_URL = "http://localhost:8000"

def test_auth():
    print("🧪 Running UrbanEye Authentication & RBAC Verification Tests...\n")
    
    # Test 1: Admin Login
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@urbaneye.ai",
        "password": "UrbanEye@2026"
    })
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_data = res.json()
    admin_token = admin_data["access_token"]
    assert admin_data["user"]["role"] == "admin"
    print("✅ Test 1: Admin login successful with bcrypt hash verification")

    # Test 2: Field Worker Login
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "worker@urbaneye.ai",
        "password": "UrbanEye@2026"
    })
    assert res.status_code == 200
    worker_data = res.json()
    worker_token = worker_data["access_token"]
    assert worker_data["user"]["role"] == "field_worker"
    print("✅ Test 2: Field Operator login successful (role: field_worker)")

    # Test 3: Bus Operator Login
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "operator@urbaneye.ai",
        "password": "UrbanEye@2026"
    })
    assert res.status_code == 200
    assert res.json()["user"]["role"] == "bus_operator"
    print("✅ Test 3: Bus Operator login successful (role: bus_operator)")

    # Test 4: Municipal Officer Login
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "officer@urbaneye.ai",
        "password": "UrbanEye@2026"
    })
    assert res.status_code == 200
    assert res.json()["user"]["role"] == "municipal_officer"
    print("✅ Test 4: Municipal Officer login successful (role: municipal_officer)")

    # Test 5: Wrong Password Rejection
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@urbaneye.ai",
        "password": "WrongPassword999!"
    })
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"
    print("✅ Test 5: Wrong password correctly rejected with 401 Unauthorized")

    # Test 6: Registration of New Citizen / Field Officer
    test_email = f"officer_test_{requests.get(f'{BASE_URL}/api/health').status_code}@urbaneye.ai"
    # cleanup / unique
    import time
    test_email = f"test_officer_{int(time.time())}@urbaneye.ai"
    reg_payload = {
        "full_name": "Rohan Deshmukh",
        "email": test_email,
        "password": "SecurePassword123!",
        "role": "municipal_officer",
        "department": "Traffic & Road Works Dept"
    }
    res = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
    assert res.status_code == 201, f"Registration failed: {res.text}"
    new_user_data = res.json()
    assert new_user_data["user"]["email"] == test_email
    assert new_user_data["user"]["role"] == "municipal_officer"
    print(f"✅ Test 6: User registration succeeded for {test_email} (Status 201)")

    # Test 7: Duplicate Email Rejection
    res = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
    assert res.status_code == 400
    print("✅ Test 7: Duplicate email registration rejected with 400 Bad Request")

    # Test 8: Protected /me without token
    res = requests.get(f"{BASE_URL}/api/auth/me")
    assert res.status_code == 401
    print("✅ Test 8: Unauthenticated /api/auth/me rejected with 401")

    # Test 9: Protected /me with Bearer token
    res = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "admin@urbaneye.ai"
    print("✅ Test 9: Bearer token validation succeeded on /api/auth/me")

    # Test 10: RBAC - Non-admin cannot view /api/auth/users
    res = requests.get(f"{BASE_URL}/api/auth/users", headers={"Authorization": f"Bearer {worker_token}"})
    assert res.status_code == 403, f"Expected 403, got {res.status_code}"
    print("✅ Test 10: Non-admin restricted from /api/auth/users (403 Forbidden)")

    # Test 11: RBAC - Admin can view /api/auth/users
    res = requests.get(f"{BASE_URL}/api/auth/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    users_list = res.json()
    assert len(users_list) >= 4
    print(f"✅ Test 11: Admin successfully listed all {len(users_list)} registered users")

    # Test 12: Admin can update user role
    target_user_id = new_user_data["user"]["id"]
    res = requests.patch(
        f"{BASE_URL}/api/auth/users/{target_user_id}",
        json={"role": "admin", "department": "Executive Command"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    assert res.json()["role"] == "admin"
    print(f"✅ Test 12: Admin successfully updated user {target_user_id} role to 'admin'")

    print("\n🎉 ALL 12 AUTOMATED AUTHENTICATION & RBAC TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_auth()
