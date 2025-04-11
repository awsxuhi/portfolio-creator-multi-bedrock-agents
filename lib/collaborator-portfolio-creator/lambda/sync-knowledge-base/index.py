import boto3
import os
import time
import json
import cfnresponse

def lambda_handler(event, context):
    """
    Lambda function to sync a Bedrock knowledge base with its data source.
    This function is triggered by a CloudFormation custom resource.
    """
    print(f"Event: {json.dumps(event)}")
    
    # Extract parameters from the event
    knowledge_base_id = event.get('ResourceProperties', {}).get('KnowledgeBaseId')
    
    # Initialize response
    response_data = {}
    
    try:
        if event['RequestType'] == 'Delete':
            # Nothing to do on delete
            cfnresponse.send(event, context, cfnresponse.SUCCESS, response_data)
            return
        
        # Initialize Bedrock client
        bedrock_agent = boto3.client('bedrock-agent-runtime')
        
        # Start the ingestion job
        print(f"Starting ingestion job for knowledge base: {knowledge_base_id}")
        response = bedrock_agent.start_ingestion_job(
            knowledgeBaseId=knowledge_base_id,
            dataSourceId='fomc-reports'  # This should match the dataSourceName in your CDK code
        )
        
        ingestion_job_id = response['ingestionJobId']
        print(f"Ingestion job started with ID: {ingestion_job_id}")
        
        # Wait for the ingestion job to complete (with timeout)
        max_wait_time = 600  # 10 minutes
        wait_interval = 10  # 10 seconds
        elapsed_time = 0
        
        while elapsed_time < max_wait_time:
            job_response = bedrock_agent.get_ingestion_job(
                knowledgeBaseId=knowledge_base_id,
                dataSourceId='fomc-reports',
                ingestionJobId=ingestion_job_id
            )
            
            status = job_response['status']
            print(f"Ingestion job status: {status}")
            
            if status == 'COMPLETE':
                print("Ingestion job completed successfully")
                response_data['IngestionJobId'] = ingestion_job_id
                response_data['Status'] = 'COMPLETE'
                cfnresponse.send(event, context, cfnresponse.SUCCESS, response_data)
                return
            
            if status in ['FAILED', 'STOPPED']:
                print(f"Ingestion job failed with status: {status}")
                response_data['IngestionJobId'] = ingestion_job_id
                response_data['Status'] = status
                cfnresponse.send(event, context, cfnresponse.FAILED, response_data)
                return
            
            # Wait before checking again
            time.sleep(wait_interval)
            elapsed_time += wait_interval
        
        # If we get here, we've timed out
        print("Timed out waiting for ingestion job to complete")
        response_data['IngestionJobId'] = ingestion_job_id
        response_data['Status'] = 'TIMEOUT'
        cfnresponse.send(event, context, cfnresponse.FAILED, response_data)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        response_data['Error'] = str(e)
        cfnresponse.send(event, context, cfnresponse.FAILED, response_data)
