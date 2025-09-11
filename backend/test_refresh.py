#!/usr/bin/env python3
import requests
import json
import time

# Base URL
BASE_URL = "http://localhost:15000/api/v1/auth"

# Test Manager 로그인
print("1. Test Manager 로그인...")
login_response = requests.post(
    f"{BASE_URL}/login",
    json={"email": "manager@test.com", "password": "Test1234!"},
    headers={"Content-Type": "application/json"}
)

if login_response.status_code == 200:
    login_data = login_response.json()
    print(f"✅ 로그인 성공!")
    print(f"   - Access Token (15분): {login_data['data']['access_token'][:50]}...")
    
    # 쿠키에서 Refresh Token 추출
    refresh_token = None
    for cookie in login_response.cookies:
        if cookie.name == 'refresh_token':
            refresh_token = cookie.value
            print(f"   - Refresh Token (30일): {refresh_token[:50]}...")
            break
    
    # 5초 대기
    print("\n2. 5초 대기 후 토큰 갱신 시도...")
    time.sleep(5)
    
    # Refresh Token으로 Access Token 갱신
    print("\n3. Refresh Token으로 새 Access Token 요청...")
    refresh_response = requests.post(
        f"{BASE_URL}/refresh",
        cookies={'refresh_token': refresh_token} if refresh_token else {},
        headers={"Content-Type": "application/json"}
    )
    
    if refresh_response.status_code == 200:
        refresh_data = refresh_response.json()
        print(f"✅ 토큰 갱신 성공!")
        print(f"   - 새 Access Token: {refresh_data['data']['access_token'][:50]}...")
        
        # 새 Refresh Token 확인
        new_refresh_token = None
        for cookie in refresh_response.cookies:
            if cookie.name == 'refresh_token':
                new_refresh_token = cookie.value
                print(f"   - 새 Refresh Token: {new_refresh_token[:50]}...")
                break
        
        # 이전 Refresh Token과 비교
        if refresh_token and new_refresh_token:
            if refresh_token != new_refresh_token:
                print("   ✅ Token Rotation 확인: 새로운 Refresh Token 발급됨")
            else:
                print("   ⚠️  동일한 Refresh Token 사용 중")
                
        # 이전 Access Token과 비교
        if login_data['data']['access_token'] != refresh_data['data']['access_token']:
            print("   ✅ 새로운 Access Token 발급 확인")
        
        # 이전 Refresh Token으로 재시도 (실패해야 함)
        print("\n4. 이전 Refresh Token으로 재시도 (실패 예상)...")
        old_refresh_response = requests.post(
            f"{BASE_URL}/refresh",
            cookies={'refresh_token': refresh_token} if refresh_token else {},
            headers={"Content-Type": "application/json"}
        )
        
        if old_refresh_response.status_code != 200:
            print(f"   ✅ 예상대로 실패! (Status: {old_refresh_response.status_code})")
            error_data = old_refresh_response.json()
            print(f"   - 에러: {error_data.get('message', 'Unknown error')}")
        else:
            print("   ⚠️  이전 토큰이 여전히 유효함!")
            
    else:
        print(f"❌ 토큰 갱신 실패: {refresh_response.status_code}")
        print(refresh_response.json())
        
else:
    print(f"❌ 로그인 실패: {login_response.status_code}")
    print(login_response.json())