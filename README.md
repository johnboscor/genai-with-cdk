# README #

This work aims at building a scalable GenAI solution for a callcenter type application. We employ the following to do so:

Infrastructure as code: Uses IaC for all architecture components using Amazon CDK​

Orchestration: The pipeline involved in preparing the data and triggering multiple actions is orchestrated using Amazon Step Functions​

Data preprocessing pipeline: Uses Traditional ML using Amazon Transcribe for audio-to-text integrated into the pipeline (vs. ad-hoc), LLM powered data synthesis to populate our knowledge base and summarization to distill the call into the most important information​

Vector database: Utilizing a RAG approach with Amazon Bedrock Knowledge Base and OpenSearch​

LLM integration: Integrates with the LLM via Amazon Bedrock​

User interface: A React front end was built to leverage the underlying GenAI powered solution to mimic a real-world application rather than relying on a ChatGPT-style interface to demo the outcome of our LLM

Architecture built:
<img width="1022" alt="image" src="https://github.com/user-attachments/assets/a32b38fc-1ea0-47d5-beae-cb7a1ae98a37">

