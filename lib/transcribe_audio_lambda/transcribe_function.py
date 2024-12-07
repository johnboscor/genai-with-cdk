import json
import boto3
import urllib.parse
import os

region = os.environ['REGION']
bucket = os.environ['BUCKET']


transcribe_client = boto3.client('transcribe', region_name = region)

def lambda_handler(event, context):
    # the audio file should be saved in the s3 bucket, not in a directory
    audio_file = event['audio_file']
     # concat the file URI
    audio_file_uri = 's3://' + bucket + '/'+ audio_file

    # parse out the file name (remove path, replace spaces with underscore, remove file extension)
    parsed_file_name = urllib.parse.urlparse(audio_file).path.split('/')[-1].replace(' ', '_').split('.')[0]

    # the transcript file name 
    job_name= f'{parsed_file_name}_transcription'

    # if there's a job with the same name (ie, if you run this lambda multiple times on the same audio file), we'll first delete the existing job (to avoid a ConflictException)
    delete_transcribe_job(job_name)
    
    # transcribe it! 
    transcription = transcribe_file(job_name, audio_file_uri)

    return {
        'statusCode': 200,
        'transcribed_file': f'{job_name}.json'
    }

def delete_transcribe_job(job_name):
    try:
        response = transcribe_client.delete_transcription_job(TranscriptionJobName=job_name)
    except Exception as e:
        # if there isn't an existing job, do nothing
        print('no job with that name')
        pass

def transcribe_file(job_name, file_uri):
    # start the transcription
    transcribe_client.start_transcription_job(
        TranscriptionJobName = job_name,
        Media = {
            'MediaFileUri': file_uri
        },
        OutputBucketName = bucket,
        # OutputKey = 'transcriptions/', # I'm opting away from a directory. File will be saved in the main bucket, with a '_transcrition' suffix
        MediaFormat = 'flac',
        LanguageCode = 'en-US',
        Settings = { 
            'MaxSpeakerLabels': 2,
            'ShowSpeakerLabels': True,
        },
    )
    
    job = transcribe_client.get_transcription_job(TranscriptionJobName = job_name)
    job_status = job['TranscriptionJob']['TranscriptionJobStatus']
        
    # delete the transcription job
    delete_transcribe_job(job_name)
    
    return job


