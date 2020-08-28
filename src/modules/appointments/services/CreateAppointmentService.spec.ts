import AppError from '@shared/errors/AppError';
import FakeNotificationsRepository from '@modules/notifications/repositories/fakes/FakeNotificationsRepository';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import CreateAppointmentService from './CreateAppointmentService';

let fakeAppointmentsRepository: FakeAppointmentsRepository;
let createAppointmentService: CreateAppointmentService;
let fakeNotificationsRepository: FakeNotificationsRepository;

describe('CreateAppointment', () => {
  beforeEach(() => {
    fakeAppointmentsRepository = new FakeAppointmentsRepository();
    fakeNotificationsRepository = new FakeNotificationsRepository();
    createAppointmentService = new CreateAppointmentService(
      fakeAppointmentsRepository,
      fakeNotificationsRepository,
    );
  });

  it('should be able to create a new appointment', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 10, 10, 12).getTime();
    });

    const appointment = await createAppointmentService.execute({
      date: new Date(2020, 10, 10, 13),
      user_id: 'user',
      provider_id: '123123123',
    });

    expect(appointment).toHaveProperty('id');
    expect(appointment.provider_id).toBe('123123123');
  });

  it('should not be able to create two appointments on the same time', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 10, 10, 12).getTime();
    });

    const appointmentDate = new Date(2020, 10, 10, 13);
    await createAppointmentService.execute({
      date: appointmentDate,
      user_id: 'user',
      provider_id: '123123123',
    });

    await expect(
      createAppointmentService.execute({
        date: appointmentDate,
        user_id: 'user',
        provider_id: '123123123',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create appointments on a past date', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 10, 10, 12).getTime();
    });

    await expect(
      createAppointmentService.execute({
        date: new Date(2020, 10, 10, 11),
        user_id: 'user',
        provider_id: 'provider',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment with same user as provider', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 10, 10, 12).getTime();
    });

    await expect(
      createAppointmentService.execute({
        date: new Date(2020, 10, 10, 13),
        user_id: 'provider',
        provider_id: 'provider',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment before 8h and after 17h', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 10, 10, 12).getTime();
    });

    await expect(
      createAppointmentService.execute({
        date: new Date(2020, 10, 11, 7),
        user_id: 'user',
        provider_id: 'provider',
      }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      createAppointmentService.execute({
        date: new Date(2020, 10, 11, 18),
        user_id: 'user',
        provider_id: 'provider',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
