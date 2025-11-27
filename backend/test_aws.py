import boto3
import os

def main():
    # Check environment variables
    print("Environment variables:")
    print(f"AWS_ACCESS_KEY_ID: {os.environ.get('AWS_ACCESS_KEY_ID', 'Not set')}")
    print(f"AWS_SECRET_ACCESS_KEY: {'Set' if os.environ.get('AWS_SECRET_ACCESS_KEY') else 'Not set'}")
    print(f"AWS_DEFAULT_REGION: {os.environ.get('AWS_DEFAULT_REGION', 'Not set')}")
    
    # Check boto3 session credentials
    session = boto3.Session()
    credentials = session.get_credentials()
    
    if credentials:
        print(f"\nBoto3 credentials found:")
        print(f"Access Key: {credentials.access_key}")
        print(f"Secret Key: {'***' + credentials.secret_key[-4:] if credentials.secret_key else 'None'}")
        print(f"Token: {'Present' if credentials.token else 'None'}")
    else:
        print("\nNo boto3 credentials found")
    
    try:
        client = boto3.client('bedrock-runtime', region_name='ap-southeast-1')
        print('✓ AWS connection successful')
        print(f'Region: {client.meta.region_name}')
    except Exception as e:
        print(f'✗ AWS connection failed: {e}')

if __name__ == "__main__":
    main()
