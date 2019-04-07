import sys
import pika
import json
from apis import Apis

channel=None
connection=None

apis = Apis()

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
channel.queue_delete(queue='request')
channel.queue_delete(queue='response')

channel.queue_declare(queue='request')
channel.queue_declare(queue='response')

def executor(ch, method, properties, body):
  print("request received : " + body.decode('utf-8'))
  print(properties)
  request = json.loads(body)
  method = request["method"]
  params = request["params"]
  reply_to = request["replyTo"]
  correlationId = request["correlationId"]
  returnVal = apis.execute(method,params)
  print("Sending response : " + str(returnVal))

  # # send a message back
  channel.basic_publish(exchange='', routing_key=reply_to,properties=pika.BasicProperties(correlation_id = correlationId), body=json.dumps(returnVal, ensure_ascii=False))


if __name__ == "__main__":
  channel.basic_consume('request',executor, auto_ack=False)
  print("started")
  channel.start_consuming()    