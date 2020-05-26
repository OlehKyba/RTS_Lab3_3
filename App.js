import * as React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import * as yup from 'yup'
import { Formik } from 'formik'

import React, { Component, Fragment } from 'react';
import { TextInput, Text, Button, Alert } from 'react-native';

const random = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(random(min, max));


class Gene {
  constructor(populationSize, y, coefficients=[1,1,2]) {
    this.y = y;
    this.chromosomSize = coefficients.length;
    this.coefficients = coefficients;
    this.mutationProbabiliy = 0;

    this.chromosoms = Array.from({length: populationSize}, () =>
        new Chromosome(this.chromosomSize, 0, 10));
  }

  handler(steps, delta){
    const findDeltas = chromosomes => {
      return chromosomes.map(chromosome => {
        const chromosomeValue = chromosome.array.reduce((accumulator, currentValue, currentIndex) => {
          return accumulator + currentValue * this.coefficients[currentIndex];
        }, 0);
        return Math.abs(this.y - chromosomeValue);
      });
    };

    const fit = deltas => {
      const sum = deltas.reduce((accumulator, currentValue) => accumulator + 1/currentValue, 0);
      return deltas.map(delta => (1/delta)/sum);
    };

    const bestChromosomeIndex = (deltas) => deltas.findIndex(Math.min(...deltas));

    let currentStep = 0;
    let deltas = findDeltas(this.chromosoms);

    for (; currentStep < steps; currentStep++) {
      const fitedValues = fit(deltas);
      const firstChromosomeIndex = fitedValues.indexOf(Math.max(...fitedValues));
      const secondChromosomeIndex = fitedValues.indexOf(Math.max(...fitedValues.slice(0, firstChromosomeIndex),
          ...fitedValues.slice(firstChromosomeIndex + 1, fitedValues.length)));

      this.chromosoms[firstChromosomeIndex].crossing(this.chromosoms[secondChromosomeIndex]);
      this.mutate();

      deltas = findDeltas(this.chromosoms);
      const winnerIndex = deltas.findIndex(currentDelta => currentDelta <= delta);

      if (winnerIndex !== -1) {
        const message = `Success in ${currentStep} step!`
        const xArray = this.chromosoms[winnerIndex].array;
        return { message, xArray };
      }
    }
    const message = 'Not enough steps!'
    const xArray = this.chromosoms[bestChromosomeIndex(deltas)].array;
    return { message, xArray };
  }

  mutate(){
    const isShouldMutate = Math.random() < this.mutationProbabiliy;
    if(isShouldMutate){
      const index = randomInt(0, this.chromosomSize);
      this.chromosoms[index].mutate();
    }
  }

  optimalMutateProbability(steps, delta){
    const mutationStep = 0.01;
    let res;
    while (this.mutationProbabiliy < 1){
      res = this.handler(steps, delta);
      if(res.message !== 'Not enough steps!'){
        res.message += `\nThe optimal probability of a mutation: ${this.mutationProbabiliy}.`
        return res;
      }
      this.mutationProbabiliy += mutationStep;
    }
    return res;
  }

}

class Chromosome {

  constructor(size, min, max) {
    this.size = size;
    this.array = Array.from({length: size}, () => randomInt(min, max));
  }

  mutate() {
    const index = randomInt(0, this.size);
    const delta = Math.round(Math.random()) ? 1 : -1;
    this.array[index] += delta;
  }

  crossing(otherChromosome) {
    const index = Math.ceil(this.size/2);
    for (let i = 0; i < index; i++) {
      const tmp = this.array[i];
      this.array[i] = otherChromosome.array[i];
      otherChromosome.array[i] = tmp;
    }
  }
}

export default class App extends Component {
  state = {
    xArray: [],
  }

  onSubmitHandler = ({ a, b, c, d, y, delta, iterationsCount }) => {
    const coefficients = [a, b, c, d];
    const populationSize = 20;

    const gene = new Gene(populationSize, y, coefficients);
    const {message, xArray} = gene.optimalMutateProbability(iterationsCount, delta);

    Alert.alert('Message!', message);
    this.setState({xArray});
  };

  render() {
    return (
        <Formik
            initialValues={{ a: 1, b: 1, c: 1, d: 1, y: 15, delta: 0.5, iterationsCount:100 }}
            onSubmit={this.onSubmitHandler}
            validationSchema={yup.object().shape({
              a: yup
                  .number()
                  .positive('Please provide positive number')
                  .integer('Please provide positive integer')
                  .required(),

              b: yup
                  .number()
                  .positive('Please provide positive number')
                  .integer('Please provide positive integer')
                  .required(),

              c: yup
                  .number()
                  .positive('Please provide positive number')
                  .integer('Please provide positive integer')
                  .required(),

              d: yup
                  .number()
                  .positive('Please provide positive number')
                  .integer('Please provide positive integer')
                  .required(),

              y: yup
                  .number()
                  .positive('Please provide positive number')
                  .integer('Please provide positive integer')
                  .required(),

              iterationsCount: yup
                  .number()
                  .positive('Please provide positive number')
                  .integer('Please provide positive integer')
                  .required(),

              delta: yup
                  .number()
                  .positive('Please provide positive number')
                  .required(),
            })}
        >
          {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) => (
              <Fragment>
                <Text>Labwork #3.3: Genetic algorithm.</Text>
                <TextInput
                    value={values.a}
                    onChangeText={handleChange('a')}
                    placeholder="a"
                    onBlur={() => setFieldTouched('a')}
                />
                {touched.a && errors.a &&
                <Text style={{ fontSize: 10, color: 'red' }}>{errors.a}</Text>
                }

                <TextInput
                    value={values.b}
                    onChangeText={handleChange('b')}
                    placeholder="b"
                    onBlur={() => setFieldTouched('b')}
                />
                {touched.b && errors.b &&
                <Text style={{ fontSize: 10, color: 'red' }}>{errors.b}</Text>
                }

                <TextInput
                    value={values.c}
                    onChangeText={handleChange('c')}
                    placeholder="c"
                    onBlur={() => setFieldTouched('c')}
                />
                {touched.c && errors.c &&
                <Text style={{ fontSize: 10, color: 'red' }}>{errors.c}</Text>
                }

                <TextInput
                    value={values.d}
                    onChangeText={handleChange('d')}
                    placeholder="d"
                    onBlur={() => setFieldTouched('d')}
                />
                {touched.d && errors.d &&
                <Text style={{ fontSize: 10, color: 'red' }}>{errors.d}</Text>
                }

                <TextInput
                    value={values.y}
                    onChangeText={handleChange('y')}
                    placeholder="y"
                    onBlur={() => setFieldTouched('y')}
                />
                {touched.y && errors.y &&
                <Text style={{ fontSize: 10, color: 'red' }}>{errors.y}</Text>
                }

                <TextInput
                    value={values.iterationsCount}
                    onChangeText={handleChange('iterationsCount')}
                    placeholder="Iterations steps."
                    onBlur={() => setFieldTouched('iterationsCount')}
                />
                {touched.iterationsCount && errors.iterationsCount &&
                <Text style={{ fontSize: 10, color: 'red' }}>{errors.iterationsCount}</Text>
                }

                <TextInput
                    value={values.delta}
                    onChangeText={handleChange('delta')}
                    placeholder="delta"
                    onBlur={() => setFieldTouched('delta')}
                />
                {touched.delta && errors.delta &&
                <Text style={{ fontSize: 10, color: 'red' }}>{errors.delta}</Text>
                }

                <Text>X1, X2, X3, X4: {this.state.xArray.toString()}</Text>

                <Button
                    title='Sign In'
                    disabled={!isValid}
                    onPress={handleSubmit}
                />
              </Fragment>
          )}
        </Formik>
    );
  }
}
