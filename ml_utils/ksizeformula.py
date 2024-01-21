import math


def ksizeformula(input_f,kernel_size, stride, padding ):

    return math.floor((input_f + (2 * padding) - kernel_size) / stride ) + 1
     

def maxpoolformula(input_f, kernel_size, stride):

    return math.floor((input_f - kernel_size)/stride) + 1


def convop(input_f, kernel_size, stride, padding):

    after_conv  = ksizeformula(input_f,kernel_size, stride, padding)
    
    after_max = maxpoolformula(after_conv, 2, 1)

    return after_max

print(convop(input_f = 28, kernel_size = 10 , stride = 1, padding = 1))
# Big k- 10 --> 10