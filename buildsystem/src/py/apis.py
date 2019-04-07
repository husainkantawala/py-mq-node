import types
import inspect

class Apis:
    def __init__(self):
        self.apiList = {
            'hello':self.hello,
            'getApis':self.getApis
        }
        print("Apis init done")

    def getApis(self):
        return [*self.apiList]

    def hello(self,str):
        print("Hello " + str)
        return str

    def execute(self,method, params):
        print("Executing method : "+  method)
        if params!=None: 
            return self.apiList[method](*params)
        else:
            return self.apiList[method]()


